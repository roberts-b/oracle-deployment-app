import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Container, Accordion, Menu, Label, Grid, Segment, Icon } from 'semantic-ui-react';
import Constants from '../../constants/constants.js';
import rpcNames from '../../constants/rpc-names.js';
import PropTypes from 'prop-types';
var log = require('electron-log');
import { List } from 'react-virtualized';

class DbStructureComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();

        this.state = {
            structureItemsArray: [],
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
                <Segment compact className='structureComponentSegmentAroundAccordion' basic loading={this.state.isLoading}>
                    <Accordion styled as={Menu} vertical fluid>
                        {this.state.structureItemsArray.map((value, i) => {
                            return <Menu.Item key={i}>
                                <Accordion.Title onClick={this.handleAccordionTitleClick}
                                    content={(<Label color='brown' >{value.itemName}</Label>)}
                                    index={i} active={value.active}>

                                </Accordion.Title>
                                <Accordion.Content className='bdStructureAccordionContent' active={value.active}>
                                    <List
                                        width={300}
                                        height={400}
                                        rowCount={value.itemValues.length}
                                        rowHeight={40}
                                        rowRenderer={
                                            ({
                                                key,         // Unique key within array of rows
                                                index,       // Index of row within collection
                                                isScrolling, // The List is currently being scrolled
                                                isVisible,   // This row is visible within the List (eg it is not an overscanned row)
                                                style        // Style object to be applied to row (to position it)
                                            }) => {
                                                return (
                                                    <div key={key} style={style}>
                                                        <Segment className='segmentAroundMenuItem' key={key}>

                                                            <Menu.Item active={value.itemValues[index].active} as='a' key={key}>
                                                                <Icon color={value.itemValues[index].valid === 'VALID' ? 'green' : 'red'}
                                                                    name={value.itemValues[index].valid === 'VALID' ? 'check circle' : 'remove circle'} />
                                                                {value.itemValues[index].name}
                                                            </Menu.Item>
                                                        </Segment>
                                                    </div>
                                                )
                                            }
                                        }
                                    />
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
            this.setState({ isLoading: false });
        });

        ipcRenderer.on(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE.respName, (event, arg) => {
            log.info('ipcRenderer.on(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE');

            if (arg.status === Constants.SUCCESS_MESSAGE) {
                //map received value to state object
                this.mapDbSubObjectsToState(arg);
            } else if (arg.status === Constants.FAILURE_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
            }
            this.setState({ isLoading: false });
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

    mapDbObjectNamesToState(res) {
        log.info('mapDbObjectNamesToState', res);
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
        this.setState({ structureItemsArray: structureItemsArray });
    }

    mapDbSubObjectsToState(res) {
        // log.info('mapDbSubObjectsToState ',res);
        const objectType = res.value.objectType;
        let valueArray = res.value.resultArray;
        let structureItemsArray = this.state.structureItemsArray;
        //we must find according object with object type provided by result [objectType]
        let requiredArrayItem = structureItemsArray.find((currentValue) => {
            return currentValue.itemName === objectType;
        });

        // log.info('mapDbSubObjectsToState found following object which matches object type: ', objectType, ' found value: ', requiredArrayItem);
        let itemValuesArray = requiredArrayItem.itemValues;

        valueArray.map((value, i) => {
            // log.info('value: ', value);
            itemValuesArray.push({
                name: value[0],
                valid: value[1],
                active: false
            });
        });
        // log.info('mapDbSubObjectsToState will put to state structureItemsArray: ', structureItemsArray);
        this.setState({ structureItemsArray: structureItemsArray });
    }
}

DbStructureComponent.PropTypes = {
    addMessageToNotificationsArray: PropTypes.func.isRequired
}


export default DbStructureComponent;