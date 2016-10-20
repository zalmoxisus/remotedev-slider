import React, { Component, PropTypes } from 'react';
import { Flex, Box } from 'reflexbox';
import Select from 'rebass/dist/Select';
import Slider from 'rebass/dist/Slider';
import Button from 'rebass/dist/Button';
import PlayButton from 'react-icons/lib/md/play-arrow';
import PauseButton from 'react-icons/lib/md/pause';
import LeftButton from 'react-icons/lib/md/keyboard-arrow-left';
import RightButton from 'react-icons/lib/md/keyboard-arrow-right';

const speedOptions = [
  { children: '.5x', value: 500 },
  { children: '1x', value: 1000 },
  { children: '2x', value: 2000 }
];

export default class SliderMonitor extends Component {
  state = {
    isPlaying: false,
    speed: 1000,
    index: undefined,
    waiting: false,
    reportId: ''
  };

  shouldComponentUpdate(nextProps, nextState) {
    const currentStateIndex = this.props.liftedState.currentStateIndex;
    const nextStateIndex = nextProps.liftedState.currentStateIndex;
    return nextState !== this.state ||
      nextProps.showActions !== this.props.showActions ||
      nextStateIndex !== currentStateIndex &&
      (nextProps.showActions || currentStateIndex < 1 || nextStateIndex < 1) ||
      nextStateIndex !== nextProps.liftedState.computedStates.length - 1 ||
      currentStateIndex !== this.props.liftedState.computedStates.length - 1 ||
      nextProps.reports !== this.props.reports;
  }

  getValue(currentStateIndex, computedStates) {
    if (this.state.waiting) {
      const index = this.state.index;
      if (typeof index !== 'undefined') return index;
    }
    return computedStates.length < 2 ? 100 :
      (currentStateIndex / (computedStates.length - 1)) * 100;
  }

  jumpToState(index, fromPlaying) {
    if (!fromPlaying && this.state.isPlaying) this.dismissPlay();
    this.props.dispatch({
      type: 'JUMP_TO_STATE',
      index
    });
  }

  handleSlider(index) {
    const limit = this.props.liftedState.computedStates.length - 1;
    if (limit < 1) return;
    let value = (index / 100) * limit;
    if (value > this.props.liftedState.currentStateIndex) {
      value = Math.ceil(value);
    } else {
      value = Math.floor(value);
    }
    this.jumpToState(value);
  }

  handleChange = (e) => {
    const index = e.target.value;
    if (this.state.waiting) {
      clearTimeout(this.waitingTimeout);
      this.waitingTimeout = setTimeout(() => {
        this.handleSlider(index);
      }, 500);
      this.setState({ index });
      return;
    }
    this.handleSlider(index);
  };

  handlePrev = () => {
    if (this.props.liftedState.currentStateIndex < 1) return;
    this.jumpToState(this.props.liftedState.currentStateIndex - 1);
  };

  handleNext = () => {
    const liftedState = this.props.liftedState;
    if (liftedState.currentStateIndex === liftedState.computedStates.length - 1) return;
    this.jumpToState(this.props.liftedState.currentStateIndex + 1);
  };

  handleArrows = (e) => {
    if (e.nativeEvent.key === 'ArrowLeft') {
      e.preventDefault(); this.handlePrev();
    } else if (e.nativeEvent.key === 'ArrowRight') {
      e.preventDefault(); this.handleNext();
    }
  };

  handleMouseDown = () => {
    this.setState({ waiting: true });
  };

  handleMouseUp = (e) => {
    clearTimeout(this.waitingTimeout);
    this.handleSlider(e.target.value);
    this.setState({ waiting: false, index: undefined });
  };

  handlePlay = () => {
    if (this.state.isPlaying) {
      this.dismissPlay();
      return;
    }

    const { speed } = this.state;
    const lastIndex = this.props.liftedState.computedStates.length - 1;
    let index = this.props.liftedState.currentStateIndex;
    if (index === lastIndex) index = -1;
    this.timer = setInterval(() => {
      index++;
      if (index <= lastIndex) this.jumpToState(index, true);
      if (index >= lastIndex) this.dismissPlay();
    }, speed);
    this.setState({ isPlaying: true });
  };

  dismissPlay() {
    clearInterval(this.timer);
    this.setState({ isPlaying: false });
  }

  handleSpeedChange = (e) => {
    this.setState({ speed: e.target.value });
    if (this.state.isPlaying) this.dismissPlay();
  };

  handleReportChange = (e) => {
    const reportId = e.target.value;
    this.setState({ reportId });
    if (!reportId) return;
    const getReport = this.props.getReport;
    if (getReport) {
      getReport(reportId);
    } else {
      const report = this.props.reports.find(r => r.id === reportId);
      if (!report || !report.payload) return;
      let nextLiftedState = report.payload;
      if (typeof nextLiftedState === 'string') nextLiftedState = JSON.parse(nextLiftedState);
      let preloadedState = report.preloadedState;
      if (typeof preloadedState === 'string') preloadedState = JSON.parse(preloadedState);
      this.props.dispatch({ type: 'IMPORT_STATE', nextLiftedState, preloadedState });
    }
  };

  render() {
    const { currentStateIndex, computedStates } = this.props.liftedState;
    const showActions = this.props.showActions && currentStateIndex !== -1;
    const value = this.getValue(currentStateIndex, computedStates);
    const isEnd = value === 100;
    const isBegin = value === 0 || currentStateIndex <= 0;
    let label = '';

    if (showActions) {
      const { actionsById, stagedActionIds } = this.props.liftedState;
      label = actionsById[stagedActionIds[currentStateIndex]].action.type;
    }

    const reports = this.props.reports;
    let reportsOptions;
    if (reports && reports.length) {
      reportsOptions = [
        { children: 'Current log', value: '' },
        ...reports.map(report => (
          { children: report.title, value: report.id }
        ))
      ];
    }

    return (
      <Flex style={this.props.style} align="center">
        <Box>
          <Button backgroundColor="transparent" p={0} onClick={this.handlePlay}>
            {this.state.isPlaying ?
              <PauseButton size={38} /> :
              <PlayButton size={38} />
            }
          </Button>
        </Box>
        <Box flexAuto px={1} style={{ overflow: 'hidden' }}>
          <Slider
            label={label}
            value={value}
            onChange={this.handleChange}
            onKeyDown={this.handleArrows}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            name="slider-monitor"
            fill color={this.props.fillColor}
            style={{
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              paddingBottom: showActions ? '13px' : '0'
            }}
          />
        </Box>
        <Box>
          <Button
            backgroundColor="transparent" p={0} style={isBegin && { display: 'none' }}
            onClick={this.handlePrev}
          >
            <LeftButton size={36} />
          </Button>
        </Box>
        <Box>
          <Button
            backgroundColor="transparent" p={0} style={isEnd && { display: 'none' }}
            onClick={this.handleNext}
          >
            <RightButton size={36} />
          </Button>
        </Box>
        <Box>
          <Select
            label="" name="select_speed"
            options={speedOptions}
            value={this.state.speed}
            onChange={this.handleSpeedChange}
            style={{ marginBottom: '0' }}
          />
        </Box>
        {reportsOptions &&
          <Box p={1}>
            <Select
              label="" name="select_report"
              options={reportsOptions}
              value={this.state.reportId}
              onChange={this.handleReportChange}
              style={{ marginBottom: '0' }}
            />
          </Box>
        }
      </Flex>
    );
  }
}

SliderMonitor.propTypes = {
  showActions: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  liftedState: PropTypes.shape({
    computedStates: PropTypes.array,
    stagedActionIds: PropTypes.array,
    actionsById: PropTypes.object,
    currentStateIndex: PropTypes.number
  }).isRequired,
  reports: PropTypes.array,
  getReport: PropTypes.func,
  style: PropTypes.object,
  fillColor: PropTypes.string
};
