import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Container, Divider, Segment, TextArea, Tab, Menu, Label, Icon, Button } from 'semantic-ui-react';
import Constants from '../../constants/constants.js';
import rpcNames from '../../constants/rpc-names.js';
import PropTypes from 'prop-types';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
require('codemirror/mode/sql/sql');

var log = require('electron-log');

class MainAreaComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();

        this.state = {
            isLoading: false,
            currentActiveTabId: -1,
            tabs: []
        }
    }

    requestDDL() {
        log.info('request DDL button clicked');
        // args['objectType'], args['objectName'], args['dbSchema']
        if (this.state.currentActiveTabId === -1) {
            this.addMessageToNotificationsArray({ isPositive: false, text: 'No active tab selected so DDL request was not send !' });
            return;
        }
        ipcRenderer.send(rpcNames.GET_DDL.reqName, {
            objectType: this.state.tabs[this.state.currentActiveTabId].groupName,
            objectName: this.state.tabs[this.state.currentActiveTabId].subGroupName
        });

        this.setState({ isLoading: true });
    };

    componentDidMount() {
        this.registerIpcListeners();

    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners([rpcNames.GET_DDL.respName]);

    }

    bindComponentListeners() {
        this.requestDDL = this.requestDDL.bind(this);
        this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
        this.handleTabCloseIconClick = this.handleTabCloseIconClick.bind(this);
        this.addNewTab = this.addNewTab.bind(this);
        this.closeAllTabs = this.closeAllTabs.bind(this);
        this.handleMenuItemOnMouseDown = this.handleMenuItemOnMouseDown.bind(this);
        this.handleResultTextAreaChange = this.handleResultTextAreaChange.bind(this);
    }

    handleMenuItemClick(event, data) {
        event.preventDefault();
        // console.log('handleMenuItemClick event: ', event, ' data: ', data.index);
        // console.log(event.nativeEvent.which);
        let currentActiveTabId = this.state.currentActiveTabId;

        const clickedTabIndex = data.index;

        if (clickedTabIndex === currentActiveTabId) {
            //skip any further activities if user clicked on already active tab
            return;
        }
        const tabs = this.state.tabs;
        //set old tab as inactivei
        if (currentActiveTabId != -1) {
            tabs[currentActiveTabId].active = false;
        }
        tabs[clickedTabIndex].active = true;
        currentActiveTabId = clickedTabIndex;



        this.setState({ tabs: tabs, currentActiveTabId: currentActiveTabId });

    }

    handleResultTextAreaChange(editor, metadata, value) {
        const tabs = this.state.tabs;
        // console.log('handleResultTextAreaChange currentActiveTabId: ', this.state.currentActiveTabId);

        if (!tabs[this.state.currentActiveTabId]) {
            //dont do anything because this tab already is closed
            console.log('dont do anything because this tab already is closed');
            return;
        }

        if (tabs[this.state.currentActiveTabId].value === value) {
            //same value already is submitted so no activities are necessary
            console.log('same value already is submitted so no activities are necessary');
            return;
        }
        tabs[this.state.currentActiveTabId].value = value;
        this.setState({ tabs: tabs });

    }

    handleTabCloseIconClick(id, event) {
        console.log('handleTabCloseIconClick event: ', event, ' data: ', id);

        event.stopPropagation();

        this.closeClickedTab(id);
    }

    addNewTab(groupName, subGroupName) {
        const tabsArray = this.state.tabs;
        let currentActiveTabId = this.state.currentActiveTabId;
        //first check if tab for this element is already opened, if yes then make it active (selected)
        let foundElementId = this.findElementAndIdByGroupAndSubGroupName(tabsArray, groupName, subGroupName).foundElementId;
        if (foundElementId != -1) {
            console.log('addNewTab tab with groupName: ', groupName, ' and subGroupName: ', subGroupName, ' already exists with id: ', foundElementId, ' so setting it active');
            if (foundElementId != currentActiveTabId) {
                //set current active tab only if there already was active tab
                if (currentActiveTabId != -1) {
                    tabsArray[currentActiveTabId].active = false;
                }
                tabsArray[foundElementId].active = true;
                this.setState({ tabs: tabsArray, currentActiveTabId: foundElementId });

            }
            return;
        }

        //such tab does not exist we must add to array new tab and make it active

        //first make old active tab inactive
        if (currentActiveTabId != -1) {
            tabsArray[currentActiveTabId].active = false;
        }

        let newLength = tabsArray.unshift({
            active: true,
            groupName: groupName,
            subGroupName: subGroupName,
            value: ''
        });
        //update state
        this.setState({ tabs: tabsArray, currentActiveTabId: 0 });



    }

    closeAllTabs() {
        this.setState({
            isLoading: false,
            currentActiveTabId: -1,
            tabs: []
        });
    }

    getNewActiveTabIdAndElement(tabsArray) {
        let newActiveTabId = -1;
        let activeElement = {};
        tabsArray.some((element, index, array) => {
            if (element.active) {
                newActiveTabId = index;
                activeElement = element;
                return true;
            }
        });
        return { newActiveTabId: newActiveTabId, activeElement: activeElement };
    }

    findElementAndIdByGroupAndSubGroupName(tabsArray, groupName, subGroupName) {
        let foundElementId = -1;
        let activeElement = {};
        tabsArray.some((element, index, array) => {
            if (element.groupName === groupName && element.subGroupName === subGroupName) {
                foundElementId = index;
                activeElement = element;
                return true;
            }
        });
        return { foundElementId: foundElementId, activeElement: activeElement };
    }

    handleMenuItemOnMouseDown(id, proxy, event) {
        proxy.preventDefault();
        // console.log('handleMenuItemOnMouseDown event.which: ', proxy.nativeEvent.which, ' proxy: ', proxy);

        if (proxy.nativeEvent.which === 2) {
            //middle mouse button was clicked close current tab
            this.closeClickedTab(id);

        }
    }

    closeClickedTab(id) {
        const tabsArray = this.state.tabs;
        let newActiveTabId = this.state.currentActiveTabId;
        tabsArray.splice(id, 1);
        newActiveTabId = this.getNewActiveTabIdAndElement(tabsArray).newActiveTabId;

        this.setState({ currentActiveTabId: newActiveTabId, tabs: tabsArray }, () => {
            this.setCurrentActiveTabToFirstIfNeeded();
        });
    }

    setCurrentActiveTabToFirstIfNeeded() {
        const tabsArray = this.state.tabs;
        let currentActiveTabId = this.state.currentActiveTabId;
        if (currentActiveTabId === -1 && tabsArray.length > 0) {
            tabsArray[0].active = true;
            currentActiveTabId = 0;
            this.setState({ tabs: tabsArray, currentActiveTabId: currentActiveTabId });
        }
    }

    render() {
        var options = {
            lineNumbers: true,
            mode: 'text/x-plsql',
            readOnly: false,
            theme: 'material'
        };
        return (
            <Container fluid>
                <Button loading={this.state.isLoading} disabled={this.state.isLoading || this.state.tabs.length === 0} onClick={this.requestDDL}>Request DDL</Button>
                <Divider />
                {/* <Tab menu={{ tabular: true, stackable: true, color: 'teal', size: 'tiny' }} panes={this.state.panes} renderActiveOnly={true} /> */}

                <Menu className='CustomTopMenu' attached='top' tabular color='teal' size='tiny'>
                    {
                        this.state.tabs.map((value, i) => {
                            return <Menu.Item onMouseDown={this.handleMenuItemOnMouseDown.bind(this, i)} index={i} onClick={this.handleMenuItemClick} className='TabsMenuItems' active={value.active} key={i}>
                                {value.subGroupName + ' (' + value.groupName + ')'}
                                <Icon key={i} color='red' name='remove' onClick={this.handleTabCloseIconClick.bind(this, i)} />
                            </Menu.Item>
                        })
                    }

                </Menu>
                <Segment disabled={this.state.tabs[this.state.currentActiveTabId] === undefined || this.state.tabs[this.state.currentActiveTabId].value === '' || this.state.isLoading}
                    loading={this.state.isLoading}
                    className='ResultsTextAreaSegment'
                    inverted basic compact attached='bottom'>
                    <CodeMirror
                        autoCursor={false}
                        value={(this.state.tabs[this.state.currentActiveTabId] === undefined) ? '' : this.state.tabs[this.state.currentActiveTabId].value}
                        onChange={this.handleResultTextAreaChange}
                        autoFocus={true}
                        options={options} />
                </Segment >
            </Container>
        )
    };

    registerIpcListeners() {
        ipcRenderer.on(rpcNames.GET_DDL.respName, (event, arg) => {
            // log.info(arg);
            if (arg.status === Constants.SUCCESS_MESSAGE) {
                const currentActiveTabId = this.state.currentActiveTabId;
                const tabs = this.state.tabs;
                if (currentActiveTabId != -1) {
                    tabs[currentActiveTabId].value = arg.value;

                }
                this.setState({ tabs: tabs, isLoading: false });
            } else if (arg.status === Constants.FAILURE_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
                this.setState({ isLoading: false });
            }
        });
    }

}

MainAreaComponent.PropTypes = {
    addMessageToNotificationsArray: PropTypes.func.isRequired
}


export default MainAreaComponent;