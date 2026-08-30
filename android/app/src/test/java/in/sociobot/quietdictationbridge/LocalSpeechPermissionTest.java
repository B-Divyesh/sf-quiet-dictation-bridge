package in.sociobot.quietdictationbridge;

import static org.junit.Assert.assertNotNull;

import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.PermissionCallback;

import org.junit.Test;

/** Guards the runtime annotation Capacitor uses to register permission launchers. */
public class LocalSpeechPermissionTest {
    @Test
    public void freshMicrophonePermissionCallbackIsRegistered() throws Exception {
        PermissionCallback callback = LocalSpeechPlugin.class
            .getDeclaredMethod("startAfterPermission", PluginCall.class)
            .getAnnotation(PermissionCallback.class);

        assertNotNull("Capacitor cannot resume a fresh permission request without @PermissionCallback", callback);
    }
}
