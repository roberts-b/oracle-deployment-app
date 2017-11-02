import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Container, Accordion, Menu, Label, Grid, Segment, Icon, Button } from 'semantic-ui-react';
import Constants from '../../constants/constants.js';
import rpcNames from '../../constants/rpc-names.js';
import PropTypes from 'prop-types';
var log = require('electron-log');
import { List } from 'react-virtualized';
import DbStructureFilterComponent from './db-object-filter-component.js';

class DbStructureComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();

        this.state = {
            structureItemsArray: [],
            isLoading: false,
            currentlySelectedItem: {
                groupId: -1,
                subGroupId: -1
            }
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
                <DbStructureFilterComponent
                    isNot={true}
                    filterExpression='expression'
                    onFilterUpdated={this.onFilterUpdated}
                    addMessageToNotificationsArray={this.props.addMessageToNotificationsArray}
                    ref={(dbStructureFilterComponentReference) => { this.dbStructureFilterComponentReference = dbStructureFilterComponentReference; }}
                />
                <Segment compact className='structureComponentSegmentAroundAccordion' basic loading={this.state.isLoading}>
                    <Accordion className='dbStructureMainAccordion' styled as={Menu} vertical fluid>
                        {this.state.structureItemsArray.map((value, i) => {
                            return <Menu.Item className='dbStructureMainAccordion' key={i}>
                                <Accordion.Title onClick={this.handleAccordionTitleClick}
                                    content={(
                                        <Container>
                                            <Label color='brown' >{value.itemName}</Label>
                                            <Button
                                                onClick={this.handleFilterButtonClick.bind(this, value.itemName)}
                                                floated='right' icon='filter' color='teal' size='mini' />
                                        </Container>
                                    )}
                                    index={i} active={value.active}>

                                </Accordion.Title>
                                <Accordion.Content className='bdStructureAccordionContent' active={value.active}>
                                    <List

                                        width={320}
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
                                                            <Menu.Item className='activeMenuItemStyle' index={index} active={value.itemValues[index].active} as='a' key={key} onClick={this.handleMenuItemSelection}>
                                                                <Icon content={i} color={value.itemValues[index].valid === 'VALID' ? 'green' : 'red'}
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
        this.handleMenuItemSelection = this.handleMenuItemSelection.bind(this);
        this.onFilterUpdated = this.onFilterUpdated.bind(this);

    }

    handleAccordionTitleClick(e, titleProps) {
        const index = titleProps.index;
        // log.info('handleAccordionTitleClick titleProps: ', index);
        let structureItemsArray = this.state.structureItemsArray;
        const active = structureItemsArray[index].active;

        structureItemsArray[index].active = !active;

        //fetch all objects if active is true and currently there is no items inside
        if (structureItemsArray[index].active && structureItemsArray[index].itemValues.length === 0) {
            //fetch values
            this.setState({ isLoading: true });
            log.info('isLoading: ', this.state.isLoading);
            ipcRenderer.send(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE.reqName, structureItemsArray[index].itemName);

        } else if (!structureItemsArray[index].active) {
            log.info('clearing itemValues array for ', structureItemsArray[index].itemName, ' because it was closed');
            structureItemsArray[index].itemValues = [];
        }


        this.setState({ structureItemsArray: structureItemsArray });
    }

    handleMenuItemSelection(event, data) {
        //get stored parent group id from  <Icon content={i} value
        const parentGroupId = data.children[0].props.content;

        //get subgroup id from index in data value <Menu.Item index={index}
        const subGroupId = data.index;

        console.log('handleMenuItemSelection parentGroupId: ', parentGroupId, ' subGroupId: ', subGroupId);

        //set this item as active
        let structureItemsArray = this.state.structureItemsArray;
        structureItemsArray[parentGroupId].itemValues[subGroupId].active = true;

        //save/update also ids to active item in state
        // currentlySelectedItem: {
        //     groupId: -1,
        //     subGroupId: -1
        // }
        const currentlySelectedItem = this.state.currentlySelectedItem;
        //initial state is -1 (set in constructor) so we are checking if there was initial state or not
        //we must remove old selected item only if there was not initial state (something was already selected before)
        if (currentlySelectedItem.groupId != -1 &&
            currentlySelectedItem.subGroupId != -1 &&
            structureItemsArray[currentlySelectedItem.groupId].itemValues[currentlySelectedItem.subGroupId] &&
            (currentlySelectedItem.groupId != parentGroupId ||
                currentlySelectedItem.subGroupId != subGroupId)) {
            structureItemsArray[currentlySelectedItem.groupId].itemValues[currentlySelectedItem.subGroupId].active = false;
        }

        this.setCurrentlySelectedItemIdsToState(parentGroupId, subGroupId);
        // this.setState({ currentlySelectedItem: currentlySelectedItem });

        //additionally we must send request to parent component that selection happened
        this.props.handleSubgroupItemSelection(structureItemsArray[currentlySelectedItem.groupId].itemName, structureItemsArray[currentlySelectedItem.groupId].itemValues[currentlySelectedItem.subGroupId].name);
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
            this.setCurrentlySelectedItemIdsToState(-1, -1);
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
        // log.info('mapDbObjectNamesToState', res);
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

    setCurrentlySelectedItemIdsToState(groupId, subGroupId) {
        const currentlySelectedItem = this.state.currentlySelectedItem;
        currentlySelectedItem.groupId = groupId;
        currentlySelectedItem.subGroupId = subGroupId;
        this.setState({ currentlySelectedItem: currentlySelectedItem });
    }

    handleFilterButtonClick(objectName, event) {
        console.log('handleFilterButtonClick event: ', event, ' data: ', objectName);

        event.stopPropagation();
        this.dbStructureFilterComponentReference.openFilterComponent(objectName);
    }

    onFilterUpdated(objectName){
        console.log('onFilterUpdated called with objectName: ', objectName);
        //open this tab and refresh it or only refresh if already opened
        let structureItemsArray = this.state.structureItemsArray;
        let foundElement = {};
        structureItemsArray.some((element, index, array) => {
            if (element.itemName === objectName) {
                foundElement = element;
                return true;
            }
        });

        //set this item to active
        foundElement.active = true;
        //call refresh 
        log.info('isLoading: ', this.state.isLoading);
        ipcRenderer.send(rpcNames.GET_ALL_OBJECTS_BY_OBJECT_TYPE.reqName, foundElement.itemName);

        //remove existing sub elements from found element
        foundElement.itemValues = [];
        this.setState({ isLoading: true, structureItemsArray: structureItemsArray });
    }
}

DbStructureComponent.PropTypes = {
    addMessageToNotificationsArray: PropTypes.func.isRequired,
    handleDbStructureItemSelection: PropTypes.func.isRequired,
    handleSubgroupItemSelection: PropTypes.func.isRequired
}


export default DbStructureComponent;