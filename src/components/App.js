import '../assets/css/App.css';
import 'semantic-ui-css/semantic.min.css';
import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import ConnectionComponent from './connection/connection-component.js';
import { Button, Container, Header, TextArea } from 'semantic-ui-react';
import Constants from '../constants/constants.js';
import ErrorSuccessModalComponent from './basic/error-success-modal.js';


class App extends React.Component {

  constructor(props) {
    super(props);
    this.bindComponentListeners();
    this.state = {
      ddl_value: '',
      notificationsArray: [],
      isLoading: false
    }
  }
  componentDidMount() {
    this.result = 'no results';
    ipcRenderer.on('getDDL_reply_async', (event, arg) => {
      console.log(arg);
      if (arg.status === Constants.SUCCESS_MESSAGE) {
        this.setState({ ddl_value: arg.value, isLoading: false });
      } else if (arg.status === Constants.FAILURE_MESSAGE) {
        this.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
        this.setState({isLoading: false });
      }
    });
  }
  render() {
    return (
      <Container>
        <ErrorSuccessModalComponent
          notificationsArray={this.state.notificationsArray}
          closeHandler={this.closeHandlerFunc}
        />
        <Container>
          <Header as='h1'>DDL requesting page</Header>
          <ConnectionComponent addMessageToNotificationsArray={this.addMessageToNotificationsArray} />
          <p>Press request DDL to get DDL for statistics view</p>
          <Button loading={this.state.isLoading} disabled={this.state.isLoading} onClick={this.requestDDL}>Request DDL</Button>
        </Container>
        <Container>
          <TextArea value={this.state.ddl_value} />
        </Container>
      </Container>
    );
  };

  requestDDL() {
    console.log('request DDL button clicked');
    // args['objectType'], args['objectName'], args['dbSchema']
    ipcRenderer.send('getDDL_async', {
      objectType: 'VIEW',
      objectName: 'TW_CLA_STATISTICS_AV',
      dbSchema: 'TIA'
    });
    this.setState({ isLoading: true });
  };

  bindComponentListeners() {
    this.requestDDL = this.requestDDL.bind(this);
    this.closeHandlerFunc = this.closeHandlerFunc.bind(this);
    this.addMessageToNotificationsArray = this.addMessageToNotificationsArray.bind(this);
  }

  closeHandlerFunc() {
    console.log('Close handler clicked!');
    this.setState({ notificationsArray: [] });
  }

  addMessageToNotificationsArray(message) {
    console.log('addMessageToNotificationsArray adding new error message: ', message);
    let notificationsArray =  this.state.notificationsArray;
    notificationsArray.push(message);
    this.setState({notificationsArray : notificationsArray});
  }

  componentWillUnmount() {
    console.log('Component will unmount called.');

    //we must deregister all IPCRenderer listeners here
    ipcRenderer.removeAllListeners(['getDDL_reply_async']);
  }
}
export default App;
