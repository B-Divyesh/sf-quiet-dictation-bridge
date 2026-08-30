package in.sociobot.quietdictationbridge;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class HoldSessionTest {
    @Test
    public void releaseBeforePermissionResolutionInvalidatesThatHold() {
        HoldSession holds = new HoldSession();
        long permissionHold = holds.begin();

        holds.release(); // pointer-up/cancel while Android permission UI is visible

        assertFalse("permission approval must not start recognition after release", holds.isActive(permissionHold));
    }

    @Test
    public void aNewHoldDoesNotReviveAnOlderPermissionRequest() {
        HoldSession holds = new HoldSession();
        long oldHold = holds.begin();
        holds.release();
        long currentHold = holds.begin();

        assertFalse(holds.isActive(oldHold));
        assertTrue(holds.isActive(currentHold));
    }

    @Test
    public void grantedPermissionStartsOnlyTheActiveHold() {
        HoldSession holds = new HoldSession();
        long permissionHold = holds.begin();

        assertEquals(HoldSession.PermissionOutcome.START, holds.afterPermission(permissionHold, true));
        assertTrue(holds.isActive(permissionHold));
    }

    @Test
    public void deniedPermissionRejectsAndReleasesTheHold() {
        HoldSession holds = new HoldSession();
        long permissionHold = holds.begin();

        assertEquals(HoldSession.PermissionOutcome.DENIED, holds.afterPermission(permissionHold, false));
        assertFalse(holds.isActive(permissionHold));
    }

    @Test
    public void permissionGrantAfterReleaseCannotStartRecognition() {
        HoldSession holds = new HoldSession();
        long permissionHold = holds.begin();
        holds.release();

        assertEquals(HoldSession.PermissionOutcome.RELEASED, holds.afterPermission(permissionHold, true));
    }
}
