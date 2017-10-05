import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Container, Header, Dropdown } from 'semantic-ui-react';

class ConnectionComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();
        this.state = {
            currentTnsname: '',
            allTnsNames: []
        }
    }

    componentDidMount() {
        this.getAllTnsNames();
        this.getCurrentTnsName();
    }


    handleTnsNameChange(event, data) {
        console.log(data);
        let newValue;
        if (data) {
            newValue = data['value'];
            
        }

        this.setState({ currentTnsname: newValue });

        //save also new value to preferences
        let result = ipcRenderer.sendSync('set_current_tns_sync', newValue);
    }

    render() {
        return (
            <Container>
                <Dropdown
                    placeholder='Select connection ...'
                    options={this.state.allTnsNames}
                    value={this.state.currentTnsname}
                    onChange={this.handleTnsNameChange}
                    button
                />

            </Container>
        );
    }

    getAllTnsNames() {
        ipcRenderer.send('get_all_tns_async');
        console.log('getOptions sent');
        ipcRenderer.on('get_all_tns_reply_async', (event, arg) => {
            let resultArray = [];
            for (let value of arg) {
                resultArray.push({
                    value: value,
                    text: value
                });
            }
            console.log('getAllTnsNames result array: ', resultArray);
            this.setState({ allTnsNames: resultArray });
        });
    };

    getCurrentTnsName() {
        const currentTnsName = ipcRenderer.sendSync('get_current_tns_sync');
        console.log('getCurrentTnsName result: ', currentTnsName);
        this.setState({ currentTnsname: currentTnsName });
    }

    bindComponentListeners() {
        this.handleTnsNameChange = this.handleTnsNameChange.bind(this);
    }
}

export default ConnectionComponent;