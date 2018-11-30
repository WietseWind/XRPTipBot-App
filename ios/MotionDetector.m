
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import "MotionDetector.h"

@implementation MotionDetector

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  NSLog(@"Motion manager init");
  
  if (self) {
    self->_motionManager = [[CMMotionManager alloc] init];
  }
  return self;
}

RCT_EXPORT_METHOD(start) {
  NSLog(@"start");
  if([self->_motionManager isDeviceMotionAvailable]) {
    [self->_motionManager
     startDeviceMotionUpdatesToQueue:[NSOperationQueue mainQueue]
     withHandler:^(CMDeviceMotion *motion, NSError *error)
     {
       double roll = motion.attitude.roll;
       double pitch = motion.attitude.pitch;
       double yaw = motion.attitude.yaw;
       
       [self.bridge.eventDispatcher sendDeviceEventWithName:@"attitude" body:@{
                                                                               @"roll" : [NSNumber numberWithDouble:roll],
                                                                               @"pitch" : [NSNumber numberWithDouble:pitch],
                                                                               @"yaw" : [NSNumber numberWithDouble:yaw]
                                                                               }
        ];
     }];
  }
}

RCT_EXPORT_METHOD(stop) {
  NSLog(@"stop");
  if([self->_motionManager isDeviceMotionActive]) {
    [self->_motionManager stopDeviceMotionUpdates];
  }
}

@end
