package in.sociobot.quietdictationbridge;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.os.Build;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;


import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

/**
 * Android's system recognizer is used directly instead of Web Speech. The
 * offline preference deliberately prevents the WebView path from silently
 * becoming cloud transcription. Users install the language pack in Android's
 * Speech Services settings when their selected language is not available.
 */
@CapacitorPlugin(
    name = "LocalSpeech",
    permissions = { @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO }) }
)
public class LocalSpeechPlugin extends Plugin implements RecognitionListener {
    private SpeechRecognizer recognizer;

    @PluginMethod
    public void available(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", hasOnDeviceRecognizer());
        result.put("permissionGranted", getPermissionState("microphone") == PermissionState.GRANTED);
        call.resolve(result);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (!hasOnDeviceRecognizer()) {
            call.reject("Android on-device speech is not installed. Use Android 12 or newer and install a language pack in Speech Services, then retry.");
            return;
        }
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "startAfterPermission");
            return;
        }
        begin(call);
    }

    public void startAfterPermission(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            call.reject("Microphone permission was not allowed. Enable it in Android app settings, then retry.");
            return;
        }
        begin(call);
    }

    private void begin(PluginCall call) {
        stopRecognizer();
        // createOnDeviceSpeechRecognizer is the force-local API; unlike a
        // general recognizer plus a preference, it cannot quietly use cloud STT.
        recognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
        recognizer.setRecognitionListener(this);
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, call.getString("language", "en-US"));
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        // This is the native, on-device contract: never fall back to remote STT.
        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        recognizer.startListening(intent);
        call.resolve();
        notifyListeners("state", textEvent("listening"));
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (recognizer != null) recognizer.stopListening();
        call.resolve();
    }

    private JSObject textEvent(String text) {
        JSObject event = new JSObject();
        event.put("text", text);
        return event;
    }

    private void sendResults(String eventName, Bundle results) {
        if (results == null) return;
        java.util.ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (matches != null && !matches.isEmpty()) notifyListeners(eventName, textEvent(matches.get(0)));
    }

    private void stopRecognizer() {
        if (recognizer != null) {
            recognizer.cancel();
            recognizer.destroy();
            recognizer = null;
        }
    }

    private boolean hasOnDeviceRecognizer() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
            && SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext());
    }

    @Override public void onReadyForSpeech(Bundle params) { }
    @Override public void onBeginningOfSpeech() { }
    @Override public void onRmsChanged(float rmsdB) { }
    @Override public void onBufferReceived(byte[] buffer) { }
    @Override public void onEndOfSpeech() { notifyListeners("state", textEvent("review")); }
    @Override public void onError(int error) { notifyListeners("error", textEvent("Android offline speech stopped (error " + error + "). Install the selected language pack and retry, or type your review.")); }
    @Override public void onResults(Bundle results) { sendResults("result", results); notifyListeners("state", textEvent("review")); }
    @Override public void onPartialResults(Bundle partialResults) { sendResults("partial", partialResults); }
    @Override public void onEvent(int eventType, Bundle params) { }

    @Override
    protected void handleOnDestroy() {
        stopRecognizer();
        super.handleOnDestroy();
    }
}
