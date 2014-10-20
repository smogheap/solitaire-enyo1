package net.minego.solitaire2;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import com.phonegap.*;
import com.zubhium.ZubhiumSDK;

public class SolitaireUniverse extends DroidGap
{
	ZubhiumSDK		sdk;

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

		sdk = ZubhiumSDK.getZubhiumSDKInstance(SolitaireUniverse.this, "dfd25efb64991beecf10adec9b1de1");
		if (sdk != null) {
			sdk.registerUpdateReceiver(SolitaireUniverse.this);
		}


		/* Go full screen for the kindle fire */
		getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
						WindowManager.LayoutParams.FLAG_FULLSCREEN |
						WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN);

        super.loadUrl("file:///android_asset/www/index.html");
    }

	@Override
	public void onDestroy()
	{
		if (sdk != null) {
			sdk.unRegisterUpdateReceiver();
		}

		super.onDestroy();
	}
}

