export default {
  static: {
    forwardsIn: 'static',
    forwardsOut: 'static',
    backwardsIn: 'static',
    backwardsOut: 'static',
  },
  fade: {
    forwardsIn: 'fadeIn',
    forwardsOut: 'fadeOut',
    backwardsIn: 'fadeIn',
    backwardsOut: 'fadeOut',
  },
  horizontal: {
    forwardsIn: 'moveFromRight',
    forwardsOut: 'moveToLeft',
    backwardsIn: 'moveFromLeft',
    backwardsOut: 'moveToRight',
  },
  horizontalEverForwards: {
    forwardsIn: 'moveFromRight',
    forwardsOut: 'moveToLeft',
    backwardsIn: 'moveFromRight',
    backwardsOut: 'moveToLeft',
  },
  horizontalEverBackwards: {
    forwardsIn: 'moveFromLeft',
    forwardsOut: 'moveToRight',
    backwardsIn: 'moveFromLeft',
    backwardsOut: 'moveToRight',
  },
  verticalDownForwards: {
    forwardsIn: 'static',
    forwardsOut: 'moveToBottom',
    backwardsIn: 'moveFromLeft',
    backwardsOut: 'moveToRight',
  },
  verticalDownBackwards: {
    forwardsIn: 'moveFromRight',
    forwardsOut: 'moveToLeft',
    backwardsIn: 'static',
    backwardsOut: 'moveToBottom',
  },
  verticalUpForwards: {
    forwardsIn: 'moveFromBottom',
    forwardsOut: 'static',
    backwardsIn: 'moveFromLeft',
    backwardsOut: 'moveToRight',
  },
  verticalUp: {
    forwardsIn: 'moveFromBottom',
    forwardsOut: 'static',
    backwardsIn: 'static',
    backwardsOut: 'moveToBottom',
  },
};
