import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Segment, Header, Dropdown, Form, Button } from 'semantic-ui-react';
import Constants from '../../constants/constants.js';
import rpcNames from '../../constants/rpc-names.js';
import PropTypes from 'prop-types';
var log = require('electron-log');

class ConnectionComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();
        this.state = {
            currentTnsname: '',
            allTnsNames: [],

            credentials: { userName: '', password: '' }
        }
    }

    componentDidMount() {
        this.registerIpcListeners();
        this.getAllTnsNames();
        this.getCurrentTnsName();

    }

    componentWillUnmount() {
        log.info('Component will unmount called.');
        this.removeAllIpcListeners();

    }

    render() {
        return (
            <Segment.Group horizontal raised size='tiny' compact>
                <Segment inverted color='grey'>
                    <Dropdown
                        placeholder='Select connection ...'
                        options={this.state.allTnsNames}
                        value={this.state.currentTnsname}
                        onChange={this.handleInputChange}
                        button
                        name='tnsDropDown'
                    />
                </Segment>
                <Segment inverted color='grey'>
                    <Form onSubmit={this.handleCredentialsSubmit}>
                        <Form.Group>
                            <Form.Input required
                                error={this.isUserNameInvalid()}
                                placeholder='User Name'
                                name='userName'
                                value={this.state.credentials.userName}
                                onChange={this.handleInputChange} />
                            <Form.Input required
                                error={this.isPasswordInvalid()}
                                type='password'
                                placeholder='Password'
                                name='password'
                                value={this.state.credentials.password}
                                onChange={this.handleInputChange} />
                            <Button onClick={this.onClickTestConnection} disabled={this.isUserNameInvalid() || this.isPasswordInvalid()} content="Test" />
                            <Form.Button disabled={this.isUserNameInvalid() || this.isPasswordInvalid()} content='Save' />
                        </Form.Group>
                    </Form>
                </Segment>
            </Segment.Group>
        );
    }

    onClickTestConnection(event) {
        //prevent default form submission
        event.preventDefault();
        log.info('onCLick');

        ipcRenderer.send(rpcNames.TEST_CONNECTION.reqName,
            {
                tnsName: this.state.currentTnsname,
                userName: this.state.credentials.userName,
                password: this.state.credentials.password
            });
    }

    handleInputChange(event, data) {
        const targetName = data.name;
        let newValue = data['value'];

        if (targetName === 'tnsDropDown') {
            if (newValue === this.state.currentTnsname) {
                //skip if selected same value
                return;
            }
            //save also new value to preferences
            let result = ipcRenderer.sendSync(rpcNames.SET_CURRENT_TNS_NAME.reqName, newValue);

            this.setState({ currentTnsname: newValue });

            let operationStatus = this.setCurrentUserNamePassword(newValue);
            if (operationStatus === Constants.SUCCESS_MESSAGE) {
                this.props.refreshDbStructureComponent();
            }
        } else if (targetName === 'userName' || targetName === 'password') {
            this.setCredentialValueToState(newValue, targetName);
        }
    }

    setCredentialValueToState(newValue, parameterNameToSet) {
        let credentials = this.state.credentials;
        if (parameterNameToSet === 'userName') {
            credentials.userName = newValue;
        } else if (parameterNameToSet === 'password') {
            credentials.password = newValue;
        }
        this.setState({ credentials: credentials });
    }

    handleCredentialsSubmit() {
        log.info('handleCredentialsSubmit new username: ' + this.state.credentials.userName + ' new password: ' + this.state.credentials.password);
        ipcRenderer.send(rpcNames.SET_USERNAME_PASSWORD_BY_TNS_NAME.reqName,
            {
                tnsName: this.state.currentTnsname,
                userName: this.state.credentials.userName,
                password: this.state.credentials.password
            });
    }

    getAllTnsNames() {
        ipcRenderer.send(rpcNames.GET_ALL_TNS_NAMES.reqName);
        log.info('getOptions sent');

        //must use once because we need responce only one time, this way we don't have to deregister this listeren
        ipcRenderer.once(rpcNames.GET_ALL_TNS_NAMES.respName, (event, arg) => {
            if (arg.status === Constants.FAILURE_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: false, text: 'Failed to get all TNS names !!' });
                return;
            }
            let resultArray = [];
            for (let value of arg.value) {
                resultArray.push({
                    value: value,
                    text: value
                });
            }
            log.info('getAllTnsNames result array: ', resultArray);
            this.setState({ allTnsNames: resultArray });
        });
    };

    getCurrentTnsName() {
        const currentTnsName = ipcRenderer.sendSync(rpcNames.GET_CURRENT_TNS_NAME.reqName);
        if (currentTnsName.status === Constants.FAILURE_MESSAGE) {
            this.props.addMessageToNotificationsArray({ isPositive: false, text: 'Failed to load current TNS name !!!' });
            return;
        }
        log.info('getCurrentTnsName result: ', currentTnsName.value);
        this.setState({ currentTnsname: currentTnsName.value });
        this.setCurrentUserNamePassword(currentTnsName.value);
    }

    bindComponentListeners() {
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCredentialsSubmit = this.handleCredentialsSubmit.bind(this);
        this.onClickTestConnection = this.onClickTestConnection.bind(this);
    }

    setCurrentUserNamePassword(tnsName) {
        const result = ipcRenderer.sendSync(rpcNames.GET_USERNAME_PASSWORD_BY_TNS_NAME.reqName, tnsName);
        log.info('setCurrentUserNamePassword initialValue = ', result);
        if (result.status === Constants.FAILURE_MESSAGE) {
            this.props.addMessageToNotificationsArray({ isPositive: false, text: 'Failed to load current username and password for tnsName: ' + tnsName });
            return result.status;
        }
        const usernamePasswordObject = result.value;
        this.setState({ credentials: usernamePasswordObject });
        return result.status;
    }

    registerIpcListeners() {
        ipcRenderer.on(rpcNames.SET_USERNAME_PASSWORD_BY_TNS_NAME.respName, (event, arg) => {
            if (arg.status === Constants.SUCCESS_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: true, text: arg.value });
                //refresh db structure
                this.props.refreshDbStructureComponent();
            } else if (arg.status === Constants.FAILURE_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
            }
        });

        ipcRenderer.on(rpcNames.TEST_CONNECTION.respName, (event, arg) => {
            if (arg.status === Constants.SUCCESS_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: true, text: arg.value });
            } else if (arg.status === Constants.FAILURE_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
            }
        });
    }

    removeAllIpcListeners() {
        log.info('connection Component will unmount called.');

        //we must deregister all IPCRenderer listeners here
        ipcRenderer.removeAllListeners([rpcNames.SET_USERNAME_PASSWORD_BY_TNS_NAME.respName]);
        ipcRenderer.removeAllListeners([rpcNames.TEST_CONNECTION.respName]);
    }

    isUserNameInvalid() {
        return this.state.credentials.userName === '';
    }

    isPasswordInvalid() {
        return this.state.credentials.password === '';
    }
}


ConnectionComponent.PropTypes = {
    addMessageToNotificationsArray: PropTypes.func.isRequired,
    refreshDbStructureComponent: PropTypes.func.isRequired
}


export default ConnectionComponent;