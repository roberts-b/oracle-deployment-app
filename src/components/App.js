import '../assets/css/App.css';
import 'semantic-ui-css/semantic.min.css';
import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import ConnectionComponent from './connection/connection-component.js';
import { Button, Container, Header, TextArea, Segment } from 'semantic-ui-react';
import Constants from '../constants/constants.js';
import rpcNames from '../constants/rpc-names.js';
import ErrorSuccessModalComponent from './basic/error-success-modal.js';
import DbStructureComponent from './database_structure/db-structure-component.js';
import MainAreaComponent from './main_area/main-area-component.js';
const log = require('electron-log');


class App extends React.Component {

  constructor(props) {
    super(props);
    this.bindComponentListeners();
    this.state = {
      notificationsArray: [],
    };
  }
  componentDidMount() {
    this.registerIpcListeners();
  }

  render() {
    return (
      <Container fluid className='MainContainer'>
        <ErrorSuccessModalComponent
                notificationsArray={this.state.notificationsArray}
                closeHandler={this.closeHandlerFunc} />
        <Segment.Group horizontal compact className='mainSegments'>
          <Segment compact className='dbStructureSegment'>
            <DbStructureComponent 
            ref={(dbStructureReference)=>{this.dbStructureReference = dbStructureReference;}}
            addMessageToNotificationsArray={this.addMessageToNotificationsArray}
            handleSubgroupItemSelection = {this.handleSubgroupItemSelection}
            />
          </Segment>
          <Segment className='MainWorkingAreaSegment'>
            <Segment.Group>
              <Segment>
                <ConnectionComponent 
                  addMessageToNotificationsArray={this.addMessageToNotificationsArray}
                  refreshDbStructureComponent = {this.refreshDbStructureComponent}
                  handleDbStructureItemSelection = {this.handleDbStructureItemSelection}
                   />
              </Segment>
              <Segment>
              <MainAreaComponent
              ref={(mainAreaComponentReference)=>{this.mainAreaComponentReference = mainAreaComponentReference;}}
              addMessageToNotificationsArray={this.addMessageToNotificationsArray}
               />
            </Segment>
            </Segment.Group>
          </Segment>
        </Segment.Group>
      </Container>
    );
  };

  

  bindComponentListeners() {
    this.closeHandlerFunc = this.closeHandlerFunc.bind(this);
    this.addMessageToNotificationsArray = this.addMessageToNotificationsArray.bind(this);
    this.refreshDbStructureComponent = this.refreshDbStructureComponent.bind(this);
    this.handleSubgroupItemSelection = this.handleSubgroupItemSelection.bind(this);
  }

  closeHandlerFunc() {
    log.info('Close handler clicked!');
    this.setState({ notificationsArray: [] });
  }

  addMessageToNotificationsArray(message) {
    log.info('addMessageToNotificationsArray adding new error message: ', message);
    let notificationsArray = this.state.notificationsArray;
    notificationsArray.push(message);
    this.setState({ notificationsArray: notificationsArray });
  }

  handleDbStructureItemSelection(selectedItem){
    log.info('handleDbStructureItemSelection selected Item: ',selectedItem);
  }

  refreshDbStructureComponent(){
    this.dbStructureReference.getDatabaseObjectNames();
    this.mainAreaComponentReference.closeAllTabs();
  }

  handleSubgroupItemSelection(groupName, subGroupName){
    this.mainAreaComponentReference.addNewTab(groupName, subGroupName);
  }

  registerIpcListeners() {
    
  }

  componentWillUnmount() {
    log.info('Component will unmount called.');

    //we must deregister all IPCRenderer listeners here
    ipcRenderer.removeAllListeners([rpcNames.GET_DDL.respName]);
  }
}
export default App;
