import React, { Component, PropTypes } from 'react';
import SliderMonitor from './Slider';

export default class RemotedevSlider extends Component {
  static update = () => ({});

  render() {
    const {
      computedStates, stagedActionIds, actionsById, currentStateIndex, dispatch,
      showActions, reports, getReport, style, fillColor
    } = this.props;
    const liftedState = { computedStates, stagedActionIds, actionsById, currentStateIndex };

    return (
      <SliderMonitor
        liftedState={liftedState}
        dispatch={dispatch}
        showActions={showActions}
        reports={reports}
        getReport={getReport}
        style={style}
        fillColor={fillColor}
      />
    );
  }
}

RemotedevSlider.propTypes = {
  showActions: PropTypes.bool,
  dispatch: PropTypes.func,
  computedStates: PropTypes.array,
  stagedActionIds: PropTypes.array,
  actionsById: PropTypes.object,
  currentStateIndex: PropTypes.number,
  reports: PropTypes.array,
  getReport: PropTypes.func,
  style: PropTypes.object,
  fillColor: PropTypes.string
};
