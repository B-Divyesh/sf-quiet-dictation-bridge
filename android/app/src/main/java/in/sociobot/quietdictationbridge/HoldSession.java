package in.sociobot.quietdictationbridge;

/**
 * Tracks the physical press that authorised recognition. Android permission
 * dialogs can outlive a pointer press, so a result is valid only while its
 * originating hold is still active.
 */
final class HoldSession {
    static final long NONE = -1L;

    private long nextToken = 0L;
    private long activeToken = NONE;

    long begin() {
        activeToken = ++nextToken;
        return activeToken;
    }

    void release() {
        activeToken = NONE;
    }

    void release(long token) {
        if (activeToken == token) activeToken = NONE;
    }

    boolean isActive(long token) {
        return token != NONE && activeToken == token;
    }
}
