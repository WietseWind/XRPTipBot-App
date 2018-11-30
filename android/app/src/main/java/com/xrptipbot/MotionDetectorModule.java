package com.xrptipbot;

import android.hardware.SensorManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.util.Log;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MotionDetectorModule extends ReactContextBaseJavaModule implements SensorEventListener {
  private SensorManager mSensorManager;
  private Sensor mAccelerometer;
  private Sensor mMagnetometer;
  private ReactApplicationContext mReactContext;
  float[] mGravity;
  float[] mGeomagnetic;

  public MotionDetectorModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactContext = reactContext;
    mSensorManager = (SensorManager)reactContext.getSystemService(reactContext.SENSOR_SERVICE);
    mAccelerometer = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
    mMagnetometer = mSensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
  }

  @Override
  public String getName() {
    return "MotionDetector";
  }

  @ReactMethod
  public void start() {
    if (mAccelerometer != null) {
      mSensorManager.registerListener(this, mAccelerometer, SensorManager.SENSOR_DELAY_UI);
      mSensorManager.registerListener(this, mMagnetometer, SensorManager.SENSOR_DELAY_UI);
    }
  }

  @ReactMethod
  public void stop() {
    mSensorManager.unregisterListener(this);
  }

  private void sendEvent(String eventName, @Nullable WritableMap params) {
    try {
      mReactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
    }
    catch (RuntimeException e) {
      Log.e("ERROR", "java.lang.RuntimeException: Trying to invoke JS before CatalystInstance has been set!");
    }
  }

  @Override
  public void onSensorChanged(SensorEvent sensorEvent) {
    Sensor sensor = sensorEvent.sensor;
    WritableMap map = Arguments.createMap();

    if (sensor.getType() == Sensor.TYPE_ACCELEROMETER)
      mGravity = sensorEvent.values;
    if (sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD)
      mGeomagnetic = sensorEvent.values;
    if (mGravity != null && mGeomagnetic != null) {
      float R[] = new float[9];
      float I[] = new float[9];
      boolean success = mSensorManager.getRotationMatrix(R, I, mGravity, mGeomagnetic);
      if (success) {
        float orientation[] = new float[3];
        mSensorManager.getOrientation(R, orientation);

        float yaw = orientation[0];
        float pitch = orientation[1];
        float roll = orientation[2];

        map.putDouble("yaw", yaw);
        map.putDouble("pitch", pitch);
        map.putDouble("roll", roll);
        sendEvent("attitude", map);
      }
    }
  }

  @Override
  public void onAccuracyChanged(Sensor sensor, int accuracy) {
  }
}
