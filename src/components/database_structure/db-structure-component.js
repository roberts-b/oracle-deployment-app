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
        const index = titleProps.index;
        log.info('handleAccordionTitleClick titleProps: ', index);
        let structureItemsArray = this.state.structureItemsArray;
        const active = structureItemsArray[index].active;
        structureItemsArray[index].active = !active;

        //fetch all objects if active is true and currently there is no items inside
        if(structureItemsArray[index].active && structureItemsArray[index].itemValues.length === 0){
            //fetch values
            this.setState({isLoading: true});
            log.info('isLoading: ',this.state.isLoading);
            ipcRenderer.send(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE.reqName,structureItemsArray[index].itemName);
            
        }else if(!structureItemsArray[index].active){
            log.info('clearing itemValues array for ', structureItemsArray[index].itemName, ' because it was closed');
            structureItemsArray[index].itemValues = [];
        }

        this.setState({ structureItemsArray: structureItemsArray });
    }

    registerIpcListeners() {
        ipcRenderer.on(rpcNames.GET_UNIQUE_OBJECT_TYPES.respName, (event, arg) => {
            log.info('ipcRenderer.on(rpcNames.GET_UNIQUE_OBJECT_TYPES');
            
            if (arg.status === Constants.SUCCESS_MESSAGE) {
                //map received value to state object
                this.mapDbObjectNamesToState(arg);
                // this.props.addMessageToNotificationsArray({ isPositive: true, text: 'Success' });
            } else if (arg.status === Constants.FAILURE_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
            }
            this.setState({isLoading: false});
        });

        ipcRenderer.on(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE.respName, (event, arg) => {
            log.info('ipcRenderer.on(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE');
            
            if (arg.status === Constants.SUCCESS_MESSAGE) {
                //map received value to state object
                this.mapDbSubObjectsToState(arg);
            } else if (arg.status === Constants.FAILURE_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
            }
            this.setState({isLoading: false});
        });
    }

    removeAllIpcListeners() {
        //we must deregister all IPCRenderer listeners here
        ipcRenderer.removeAllListeners([rpcNames.GET_UNIQUE_OBJECT_TYPES.respName]);
        ipcRenderer.removeAllListeners([rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE.respName]);
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

    mapDbSubObjectsToState(res){
        // log.info('mapDbSubObjectsToState ',res);
        const objectType = res.value.objectType;
        let valueArray = res.value.resultArray;
        let structureItemsArray = this.state.structureItemsArray;
        //we must find according object with object type provided by result [objectType]
        let requiredArrayItem = structureItemsArray.find((currentValue) =>{
            return currentValue.itemName === objectType;
        });

        // log.info('mapDbSubObjectsToState found following object which matches object type: ', objectType, ' found value: ', requiredArrayItem);
        let itemValuesArray = requiredArrayItem.itemValues;

        valueArray.map((value, i) => {
            // log.info('value: ', value);
            itemValuesArray.push({
                        name: value[0],
                        valid: value[1]
                    });
        });
        // log.info('mapDbSubObjectsToState will put to state structureItemsArray: ', structureItemsArray);
        this.setState({structureItemsArray: structureItemsArray});
    }
}

DbStructureComponent.PropTypes = {
    addMessageToNotificationsArray: PropTypes.func.isRequired
}


export default DbStructureComponent;