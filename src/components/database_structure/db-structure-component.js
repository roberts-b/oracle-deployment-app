import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Container, Accordion, Menu, Label, Grid, Divider, Segment } from 'semantic-ui-react';
import Constants from '../../constants/constants.js';
import rpcNames from '../../constants/rpc-names.js';
import PropTypes from 'prop-types';
var log = require('electron-log');

class DbStructureComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();

        this.state = {
            structureItemsArray: [],
            // structureItemsArray: [{
            //     itemName: 'View',
            //     active: false,
            //     itemValues: [{
            //         name: 'Statistics'
            //     },
            //     {
            //         name: 'Recourse'
            //     }]
            // },
            // {
            //     itemName: 'Table',
            //     active: false,
            //     itemValues: [{
            //         name: 'Statistics Table'
            //     },
            //     {
            //         name: 'Recourse Table'
            //     }]
            // }],
            isLoading: false
        }
    }

    componentDidMount() {
        this.registerIpcListeners();
        this.getDatabaseObjectNames();

    }

    componentWillUnmount() {
        log.info('db-structure-component Component will unmount called.');
        this.removeAllIpcListeners();

    }

    render() {
        return (
            <Container fluid>
                <Segment compact basic loading={this.state.isLoading}>
                    <Accordion styled as={Menu} vertical fluid>
                        {this.state.structureItemsArray.map((value, i) => {
                            return <Menu.Item key={i}>
                                <Accordion.Title onClick={this.handleAccordionTitleClick}
                                    content={(<Label color='brown' >{value.itemName}</Label>)}
                                    index={i} active={value.active}>

                                </Accordion.Title>
                                <Accordion.Content active={value.active}>
                                    <Grid celled>
                                        {
                                            value.itemValues.map((subValue, j) => {
                                                return <Grid.Row key={j}>
                                                    <Grid.Column className='dbStructureGridColumn' textAlign='right'>
                                                        <Menu.Item as='a' key={j}>{subValue.name}</Menu.Item>
                                                    </Grid.Column>
                                                </Grid.Row>
                                            })}
                                    </Grid>
                                </Accordion.Content>
                            </Menu.Item>
                        })}
                    </Accordion>
                </Segment>
            </Container>
        );

    }

    bindComponentListeners() {
        this.handleAccordionTitleClick = this.handleAccordionTitleClick.bind(this);

    }

    handleAccordionTitleClick(e, titleProps) {
        log.info('handleAccordionTitleClick titleProps: ', titleProps.index);
        let structureItemsArray = this.state.structureItemsArray;
        const active = structureItemsArray[titleProps.index].active;
        structureItemsArray[titleProps.index].active = !active;
        this.setState({ structureItemsArray: structureItemsArray });
    }

    registerIpcListeners() {
        ipcRenderer.on(rpcNames.GET_UNIQUE_OBJECT_TYPES.respName, (event, arg) => {
            log.info('ipcRenderer.on(rpcNames.GET_UNIQUE_OBJECT_TYPES');
            this.setState({isLoading: false});
            if (arg.status === Constants.SUCCESS_MESSAGE) {
                //map received value to state object
                this.mapDbObjectNamesToState(arg);
                // this.props.addMessageToNotificationsArray({ isPositive: true, text: 'Success' });
            } else if (arg.status === Constants.FAILURE_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
            }
        });
    }

    removeAllIpcListeners() {

        //we must deregister all IPCRenderer listeners here
        ipcRenderer.removeAllListeners([rpcNames.GET_UNIQUE_OBJECT_TYPES.respName]);
    }

    getDatabaseObjectNames() {
        ipcRenderer.send(rpcNames.GET_UNIQUE_OBJECT_TYPES.reqName);
        log.info('getDatabaseObjectNames sent');
        this.setState({ isLoading: true });

    }

    mapDbObjectNamesToState(res){
        log.info('mapDbObjectNamesToState',res);
        let valueArray = res.value;
        let structureItemsArray = [];
        valueArray.map((value, i) => {
            log.info('value: ', value);
            structureItemsArray.push({
                itemName: value[0],
                active: false,
                itemValues: []
            });
        });
        this.setState({structureItemsArray: structureItemsArray});
    }
}

DbStructureComponent.PropTypes = {
    addMessageToNotificationsArray: PropTypes.func.isRequired
}


export default DbStructureComponent;