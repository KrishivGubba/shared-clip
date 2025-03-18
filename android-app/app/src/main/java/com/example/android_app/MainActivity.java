package com.example.android_app;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import java.util.Random;

public class MainActivity extends Activity {

    private static String generateKey(int length){
        Random rand = new Random();
        String build = "";
        for (int i = 0; i < 12; i++){
            int pick = rand.nextInt();
            if (pick%2 == 0) {
                int randomNumber = rand.nextInt(26);
                char randomChar = (char) ('a' + randomNumber);
                build = build.concat(String.valueOf(randomChar));
            } else{
                int randomNumber = rand.nextInt(9);
                build = build.concat(String.valueOf(randomNumber));
            }
        }
        return build;
    }

    public void clickMe(View view){
        TextView text = findViewById(R.id.enterText);
        text.setText(generateKey(12));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        System.out.println("hello");
    }
}
