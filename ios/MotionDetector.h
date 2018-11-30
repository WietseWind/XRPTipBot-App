
#import <React/RCTBridgeModule.h>
#import <CoreMotion/CoreMotion.h>

@interface MotionDetector : NSObject <RCTBridgeModule> {
  CMMotionManager *_motionManager;
}
- (void) start;
- (void) stop;
@end
