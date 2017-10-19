import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Container, Divider, Segment, TextArea, Tab, Menu, Label, Icon, Button } from 'semantic-ui-react';
import Constants from '../../constants/constants.js';
import rpcNames from '../../constants/rpc-names.js';
import PropTypes from 'prop-types';

var log = require('electron-log');

class MainAreaComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();

        this.state = {
            isLoading: false,
            currentActiveTabId: -1,
            tabs: [
                {
                    active: false,
                    name: 'Demo tab name1',
                    value: 'value 1'
                },
                {
                    active: false,
                    name: 'Demo tab name2',
                    value: 'value 2'
                },
                {
                    active: false,
                    name: 'Demo tab name3',
                    value: 'value 2'
                },
                {
                    active: false,
                    name: 'Demo tab name4',
                    value: 'value 2'
                }
            ]
        }
    }

    requestDDL() {
        log.info('request DDL button clicked');
        // args['objectType'], args['objectName'], args['dbSchema']
        ipcRenderer.send(rpcNames.GET_DDL.reqName, {
            objectType: 'VIEW',
            objectName: 'TW_CLA_STATISTICS_AV',
            dbSchema: 'TIA'
        });

        this.setState({ isLoading: true });
    };

    componentDidMount() {
        this.registerIpcListeners();
        // this.setCurrentActiveTabToFirstIfNeeded();

    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners([rpcNames.GET_DDL.respName]);

    }

    bindComponentListeners() {
        this.requestDDL = this.requestDDL.bind(this);
        this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
        this.handleTabCloseIconClick = this.handleTabCloseIconClick.bind(this);
    }

    handleMenuItemClick(event, data) {
        console.log('handleMenuItemClick event: ', event, ' data: ', data.index);
        let currentActiveTabId = this.state.currentActiveTabId;
        const tabs = this.state.tabs;
        const clickedTabIndex = data.index;

        //set old tab as inactivei
        if(currentActiveTabId != -1){
            tabs[currentActiveTabId].active = false;
        }
            tabs[clickedTabIndex].active = true;
            currentActiveTabId = clickedTabIndex;



        this.setState({ tabs: tabs, currentActiveTabId: currentActiveTabId });

    }

    handleTabCloseIconClick(proxy, event, id) {
        console.log('handleTabCloseIconClick proxy:',proxy,' event: ', event, ' data: ', id);

        proxy.stopPropagation();

        const tabsArray = this.state.tabs;
        let currentActiveTabId = this.state.currentActiveTabId;
        tabsArray.splice(id, 1);
        if (currentActiveTabId === id) {
            //closed active tab so lets make first tab as current active tab
            currentActiveTabId = -1;
        }
        this.setState({ tabs: tabsArray, currentActiveTabId: currentActiveTabId });
    }

    setCurrentActiveTabToFirstIfNeeded(){
        const tabsArray = this.state.tabs;
        let currentActiveTabId = this.state.currentActiveTabId;
        if(currentActiveTabId === -1 && tabsArray.length > 0){
            tabsArray[0].active = true;
            currentActiveTabId = 0;
            this.setState({ tabs: tabsArray, currentActiveTabId: currentActiveTabId });
        }
    }

    render() {
        return (
            <Container fluid>
                <Button loading={this.state.isLoading} disabled={this.state.isLoading} onClick={this.requestDDL}>Request DDL</Button>
                <Divider />
                {/* <Tab menu={{ tabular: true, stackable: true, color: 'teal', size: 'tiny' }} panes={this.state.panes} renderActiveOnly={true} /> */}

                <Menu className='CustomTopMenu' attached='top' tabular color='teal' size='tiny'>
                    {
                        this.state.tabs.map((value, i) => {
                            return <Menu.Item index={i} onClick={this.handleMenuItemClick} className='TabsMenuItems' active={value.active} key={i}>
                                {value.name}
                                <Icon key={i} color='red' name='remove' onClick={(proxy, event) => { this.handleTabCloseIconClick(proxy, event, i); }} />
                            </Menu.Item>
                        })
                    }

                </Menu>
                <Segment className='ResultsTextAreaSegment' inverted basic compact attached='bottom'>
                    <TextArea className='MainWorkingTextArea' value={this.state.currentActiveTabId === -1 ? '' : this.state.tabs[this.state.currentActiveTabId].value} />
                </Segment >
            </Container>
        )
    };

    registerIpcListeners() {
        ipcRenderer.on(rpcNames.GET_DDL.respName, (event, arg) => {
            log.info(arg);
            if (arg.status === Constants.SUCCESS_MESSAGE) {
                const currentActiveTabId = this.state.currentActiveTabId;
                const tabs = this.state.tabs;
                tabs[currentActiveTabId].value = arg.value;
                this.setState({ tabs: tabs, isLoading: false });
            } else if (arg.status === Constants.FAILURE_MESSAGE) {
                this.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
                this.setState({ isLoading: false });
            }
        });
    }

}

MainAreaComponent.PropTypes = {
    addMessageToNotificationsArray: PropTypes.func.isRequired
}


export default MainAreaComponent;