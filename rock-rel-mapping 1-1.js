/**
 ** Sample Data for LHS and RHS Grids
  
    this.leftSideData = [
			{ id: "scoal11320231", displayName: "Left Tax Specific Accounts" },
			{ id: "scoal11320452", displayName: "Left Tax Adjustments" },
			{ id: "scoal11320893", displayName: "Left Key Tax Figures" },
			{ id: "scoal11320934", displayName: "Left Advertising (including sponsorship costs)" },
			{ id: "scoal11320675", displayName: "Left Capital gains" },
			{ id: "scoal11320836", displayName: "Left Assets" },
			{ id: "scoal11320677", displayName: "Left Current Assets" },
			{ id: "scoal11320348", displayName: "Left Non-current Assets" }
		]
	this.rightSideData = [
			{ id: "scoal113201", displayName: "Tax Specific Accounts", filePath: ['Tax Specific Accounts'], type: 'folder' },
			{ id: "scoal214191", displayName: "Tax Adjustments", filePath: ['Tax Specific Accounts', 'Tax Adjustments'], type: 'folder' },
			{ id: "scoal214296", displayName: "Key Tax Figures", filePath: ['Tax Specific Accounts', 'Key Tax Figures'], type: 'file' },
			{ id: "scoal214296", displayName: "Key Tax Figures xx", filePath: ['Tax Specific Accounts', 'Key Tax Figures xx'], type: 'file' },
			{ id: "scoal414194", displayName: "Advertising (including sponsorship costs)", filePath: ['Tax Specific Accounts', 'Tax Adjustments', 'Advertising (including sponsorship costs)'], type: 'file' },
			{ id: "scoal414195", displayName: "Capital gains", filePath: ['Tax Specific Accounts', 'Tax Adjustments', 'Advertising (including sponsorship costs)', 'Capital gain'], type: 'file' },
			{ id: "scoal14139", displayName: "Assets", filePath: ['Assets'], type: 'folder' },
			{ id: "scoal24144", displayName: "Current Assets", filePath: ['Assets', 'Current Assets'], type: 'file' },
			{ id: "scoal24148", displayName: "Non-current Assets", filePath: ['Assets', 'Non-current Assets'], type: 'file' },
		];
	this.leftSideColumns = [
			{ field: 'id', rowDrag: true },
			{ field: 'displayName' },
		]
	this.rightSideColumns = [
			{ field: 'id' },
			{ field: 'displayName' },
		]

 */

import { LitElement, html } from 'lit';
import { MixinManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/mixin-manager.js';
import { RufElement } from '@riversandtechnologies/ui-platform-elements/lib/base/ruf-element.js';
import { AppBase } from '@riversandtechnologies/ui-platform-elements/lib/base/app-base.js';
import ComponentConfigBase from '@riversandtechnologies/ui-platform-business-elements/lib/base/component-config-base.js';
import { ObjectUtils } from '@riversandtechnologies/ui-platform-utils/lib/common/ObjectUtils.js';
import { ContextUtils } from '@riversandtechnologies/ui-platform-utils/lib/mdm/ContextUtils.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-spinner/pebble-spinner.js';
import '@riversandtechnologies/ui-platform-business-elements/lib/elements/rock-layout/rock-titlebar/rock-titlebar.js';
import { ComponentManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/component-manager.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-button/pebble-button.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-icon/pebble-icon.js';
import { UniqueIdUtils } from '@riversandtechnologies/ui-platform-utils/lib/common/UniqueIdUtils.js';
import NotificationHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/NotificationHelper.js';
import { FileUploadManager } from '@riversandtechnologies/ui-platform-business-elements/lib/managers/FileUploadManager.js';
import { DataObjectManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/DataObjectManager.js';
import { AppInstanceManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/app-instance-manager.js';
import { OSElements } from '@riversandtechnologies/ui-platform-elements/lib/base/os-elements.js';
import { EntityTypeManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/EntityTypeManager.js';

import './rock-drag-drop-grid.js';
import { DialogManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/dialog-manager.js';

import { ToastManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/toast-manager.js';
// Include Styles
import { styles as sharedStyles } from '@riversandtechnologies/ui-platform-elements/lib/flow/core/base/shared.element.css.js';
import { styles as localStyle } from './rock-relationship-mappings.element.css.js';
import RelMappingHelper from '../../helpers/RelMappingHelper.js';

class RockRelationshipMappings extends MixinManager(LitElement).with(AppBase, RufElement, ComponentConfigBase) {
    render() {
        return html` <pebble-spinner .active=${this._loading}></pebble-spinner>
            ${this._readyToRender
                ? html`
                ${
                    !ObjectUtils.isEmpty(this.appConfig)
                        ? html`
                              <rock-titlebar
                                  slot="rock-titlebar"
                                  .icon=${this.appConfig.icon}
                                  .mainTitle=${this.appConfig.title}
                                  .nonMinimizable=${this.appConfig.nonMinimizable}
                                  .nonClosable=${this.appConfig.nonClosable}
                              >
                              </rock-titlebar>
                          `
                        : html``
                }
                <div class="base-grid-structure">
                    <div class="base-grid-structure-child-1 top-container"  flow-layout="p-b:sm p-r:sm">
                        <pebble-button
                            medium-text=""
                            noink=""
                            icon="pebble-icon:action-download"
                            class="icon  m-l-5 m-r-5"
                            id="download"
                            title="Download"
                            @click=${this._onDownload}
                            is-ruf-component=""
                        >
                        </pebble-button>
                        <pebble-button
                            medium-text=""
                            noink=""
                            icon="pebble-icon:publish"
                            class="icon  m-l-5 m-r-5"
                            id="upload"
                            title="Upload"
                            @click=${this._onUpload}
                            is-ruf-component=""
                        >
                        </pebble-button>
                        ${
                            this._isGoverned
                                ? html`
                                      <pebble-button
                                          icon="pebble-icon:workflow-manage"
                                          class="icon m-l-5 m-r-5"
                                          id="searchMappingRequest"
                                          title=${this.localize('PenReqTxt')}
                                          @click=${this._searchMappingRequest}
                                      >
                                      </pebble-button>
                                  `
                                : ''
                        }
                    </div>
                    <div class="base-grid-structure-child-2">
                        <div class="container full-height">
                            <div flow-layout="horizontal gap:sm align:vertical-center" class="full-height">
                                <div class="full-height leftContainer" flow-layout="align:vertical-stretch">
                                    <rock-drag-drop-grid 
                                        id="leftGrid"
                                        .config=${this.config?.source}
                                        configType="source"
                                        .contextData=${this.contextData}
                                        .options=${{}}>
                                    </<rock-drag-drop-grid>
                                </div>
                                <div class="centerContainer full-height" >
                                    <pebble-button
                                        class="btn btn-outline-primary auto-width pebble-icon-dimension"
                                        icon="pebble-icon:action-scope-take-selection"
                                        title=${this.localize('MovSelTxt')}
                                        @tap=${this._onMoveRightClick}
                                    >
                                    </pebble-button>
                                </div>
                                <div class="full-height leftContainer" flow-layout="align:vertical-stretch">
                                    <rock-drag-drop-grid 
                                        id="rightGrid" 
                                        .config=${this.config?.target}
                                        configType="target"
                                        .contextData=${this.contextData}
                                        .dropZone=${true}
                                        .options=${{}}>
                                    </rock-drag-drop-grid>
                                </div>              
                            </div>              
                        </div>
                    </div>
                </div>`
                : html``}`;
    }

    static get styles() {
        return [sharedStyles, localStyle];
    }

    static get properties() {
        return {
            config: { type: Object },
            contextData: { type: Object },
            appConfig: { type: Object },
            mappedRelName: { type: String },
            actions: { type: Object },
            syncThreshold: { type: Number },
            notificationWaitTimer: { type: Number },
            mappingRequestDomain: { type: String },
            allowOneToOneMapping: { type: Boolean},
            _notificationTracker: { type: Object },
            _erroredEntities: { type: Object },
            _isGoverned: { type: Boolean },
            _readyToRender: { type: Boolean },
            _loading: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.config = {};
        this.contextData = {};
        this.actions = {
            'mapping-save-clicked': {
                name: 'mapping-save-clicked'
            },
            'mapped-filter-change': {
                name: 'mapped-filter-change'
            },
            'control-dirty-check': {
                name: 'control-dirty-check'
            },
            'source-changed': {
                name: 'source-changed'
            },
            'domain-changed': {
                name: 'domain-changed'
            },
            'reset-mapped-filters': {
                name: 'reset-mapped-filters'
            },
            'entity-import-govern-complete': {
                name: 'entity-import-govern-complete'
            },
            'entity-import-completed-with-error': {
                name: 'entity-import-completed-with-error'
            },
            'entity-import-fail': {
                name: 'entity-import-fail'
            },
            'save-complete': {
                name: 'save-complete'
            },
            'save-fail': {
                name: 'save-fail'
            }
        };
        this.appConfig = {};
        this.mappedRelName = 'ismappedto';
        this.syncThreshold = 20;
        this.notificationWaitTimer = 15000;
        this.mappingRequestDomain = 'thing';
        this.allowOneToOneMapping = false;

        this._loading = true;
        this._readyToRender = false;
        this._notificationTracker = {};
        this._erroredEntities = {};
        this._isGoverned = false;
    }

    actionCallback(actionName, detail) {
        switch (actionName) {
            case 'mapping-save-clicked': {
                this.handleSaveClick(detail);
                break;
            }
            case 'mapped-filter-change': {
                this.handleMappedFilterChange(detail);
                break;
            }
            case 'control-dirty-check': {
                this.handleControlIsDirty(detail);
                break;
            }
            case 'source-changed': {
                this.onSourceChange(detail);
                break;
            }
            case 'domain-changed': {
                this.onDomainChange(detail);
                break;
            }
            case 'reset-mapped-filters': {
                this.onResetMappedFilters(detail);
                break;
            }

            case 'entity-import-completed-with-error':
            case 'entity-import-fail':
            case 'save-fail':
                {
                    let data = detail.data;
                    //Handle save operation fail
                    if (data && data.context) {
                        const { id, type, processId } = data.context;
                        if (!this._erroredEntities[processId]) {
                            this._erroredEntities[processId] = [];
                        }

                        if (!this._erroredEntities[processId].find(v => v.id == id)) {
                            this._notificationTracker[processId]--;
                            this._erroredEntities[processId].push({ id: id, type: type, message: data.description });
                        }
                        this._isProcessCompleted(processId);
                    }
                }
                break;

            case 'entity-import-govern-complete':
            case 'save-complete':
                {
                    let data = detail.data;
                    //Handle save operation success
                    if (data && data.context) {
                        const { processId } = data.context;
                        if (this._notificationTracker[processId]) {
                            this._notificationTracker[processId]--;
                            this._isProcessCompleted(processId);
                        }
                    }
                }
                break;
        }
    }

    get sourceGrid() {
        return this.shadowRoot.querySelector('#leftGrid');
    }

    get targetGrid() {
        return this.shadowRoot.querySelector('#rightGrid');
    }

    /**
     * Function to build the save request when save btn is clicked
     */
    async handleSaveClick(detail) {
        if (detail.changedData.length <= 0) {
            ToastManager.showWarningToast(this.localize('TstNoCha'));
            return;
        }
        this._loading = true;
        //Right grid is source for us as entity relationship owner is chooosen on right and data from left is whereused
        const targetGrid = this.targetGrid;
        const sourceGrid = this.sourceGrid;

        let targetEntityType = targetGrid._selectedSource?.id;
        let sourceEntityType = sourceGrid._selectedSource?.id;
        let sourceEntityTypeExternalName = sourceGrid._selectedSource?.value;
        let targetEntityTypeExternalName = targetGrid._selectedSource?.value;

        if (targetGrid._selectedDomain.hasClassifications === true) {
            targetEntityType = targetGrid._selectedDomain?.manageModelName;
            targetEntityTypeExternalName = EntityTypeManager.getTypeExternalNameById(targetEntityType);
        }
        if (sourceGrid._selectedDomain.hasClassifications === true) {
            sourceEntityType = sourceGrid._selectedDomain?.manageModelName;
            sourceEntityTypeExternalName = EntityTypeManager.getTypeExternalNameById(sourceEntityType);
        }
        const targetContext = RelMappingHelper.createContextObj(this.targetGrid?._selectedContext);
        const targetContextInString = RelMappingHelper.objToString(targetContext);
        this.saveEntities = [];
        let saveRequest = {};
        let pendingMappingRequests = [];
        let existingMappingRequests = [];

        const mappedRelationship = targetGrid?._selectedRelationship?.relationshipName;
        if (this._isGoverned) {
            pendingMappingRequests = await RelMappingHelper.getPendingMappingRequests(
                mappedRelationship,
                targetContextInString
            );
        }

        for (let data of detail.changedData) {
            //Set the linkStatus based on user action
            let linkStatus = data.action == 'unlink' ? 'Unlink' : 'Link';
            if (this._isGoverned) {
                let user = this.contextData[ContextUtils.CONTEXT_TYPE_USER][0].user.split('_')[0];
                // Check if the mapping request object already exists for the data at hand. If exists, then don't create one more.
                if (
                    RelMappingHelper.isAnExistingMappingRequest(
                        data.id,
                        data.droppedToId,
                        targetContextInString,
                        linkStatus,
                        mappedRelationship,
                        pendingMappingRequests
                    )
                ) {
                    existingMappingRequests.push({
                        sourceId: data.externalName,
                        targetId: data.droppedToExternalName
                    });
                    continue;
                }
                //Create mapping request entity
                const mappingRequestAttributes = {
                    targetId: data.droppedToId,
                    sourceId: data.id,
                    targetPath: data.droppedToPath,
                    sourcePath: data.externalnamepath,
                    linkStatus: linkStatus,
                    targetExternalName: data.droppedToExternalName,
                    sourceExternalName: data.externalName,
                    targetEntityType: targetEntityType,
                    sourceEntityType: sourceEntityType,
                    relationship: data.droppedToRel,
                    user: user,
                    mappedContext: targetContextInString,
                    sourceEntityTypeExternalName: sourceEntityTypeExternalName,
                    targetEntityTypeExternalName: targetEntityTypeExternalName
                };
                saveRequest = RelMappingHelper.createMappingRequestDataRequest(mappingRequestAttributes);
            } else {
                //Directly Create Relationship btwn source and target with process api
                saveRequest = await RelMappingHelper.createRelMappingSaveRequest(
                    data.droppedToId,
                    data.id,
                    data.droppedToRel,
                    targetEntityType,
                    sourceEntityType,
                    this.saveEntities,
                    linkStatus,
                    targetContext
                );
            }
            this.saveEntities = _.union(this.saveEntities, [saveRequest]);
        }

        if (!ObjectUtils.isEmpty(this.saveEntities)) {
            await this.saveUpdatedRelMappings();
        }

        if (!ObjectUtils.isEmpty(existingMappingRequests)) {
            const sourceIds = _.pluck(existingMappingRequests, 'sourceId');
            const targetIds = _.pluck(existingMappingRequests, 'targetId');
            ToastManager.showWarningToast(
                this.localize('MapReqExiTxt', { sourceIds: sourceIds, targetIds: targetIds })
            );

            if (ObjectUtils.isEmpty(this.saveEntities)) {
                this._loading = false;
            }
        }
    }

    /**
     * Function to save and handle notifications
     */
    async saveUpdatedRelMappings() {
        if (ObjectUtils.isEmpty(this.saveEntities)) {
            ToastManager.showWarningToast(this.localize('TstNoCha'));
            return;
        }

        let processId = UniqueIdUtils.generateUUID();
        let isAsyncProcess = this.saveEntities.length > this.syncThreshold ? true : false;
        let isSaveSuccess = false;
        if (isAsyncProcess) {
            let fileContent = {
                entities: this.saveEntities
            };

            const blob = new Blob([JSON.stringify(fileContent)]);
            let file = new File([blob], UniqueIdUtils.generateUUID() + '.json', { type: 'application/json' });
            let fileUploadManager = new FileUploadManager();

            //If the response is success, start notificationTimer else stop the progress
            let response = await fileUploadManager.uploadAndProcess(file, processId);
            if (
                response &&
                response.dataObjectOperationResponse &&
                response.dataObjectOperationResponse.status == 'success'
            ) {
                //Start the notification tracker
                this._initializeNotificationTracker(processId, 1);
                isSaveSuccess = true;
            }
        } else {
            let saveRequest = {
                entities: this.saveEntities
            };
            let options = {
                dataIndex: 'entityData',
                validateRequest: false,
                clientStateInfo: NotificationHelper.prepareClientStateInfo(saveRequest),
                objectsCollectionName: 'entities',
                checkDuplicates: false
            };

            if (ObjectUtils.isValidObjectPath(options, 'clientStateInfo.notificationInfo.context')) {
                options.clientStateInfo.notificationInfo.context.appName = 'rock-relationship-mappings';
                options.clientStateInfo.notificationInfo.context.processId = processId;
            }

            //Start the notification tracker
            this._initializeNotificationTracker(processId, this.saveEntities.length);

            //Send the update request
            let operation = this._isGoverned ? 'create' : 'update';
            let entitySaveRequest = DataObjectManager.createRequest(operation, saveRequest, '', options);
            let entitySaveResponse = await DataObjectManager.initiateRequest(entitySaveRequest);
            //If the response is success, start notificationTimer else stop the progress
            if (entitySaveResponse && entitySaveResponse.response && entitySaveResponse.response.status == 'success') {
                isSaveSuccess = true;
            }
        }

        //If save is sucessful, start the notiification timer, else stop the step progress
        if (isSaveSuccess) {
            this.targetGrid.onRemoveTargetGridChangedInfo();
            this._startNotificationTimer(processId);
        } else {
            this._handleSaveFailure(processId);
        }
    }

    /**
     * Function to populate the notification tracker
     */
    _initializeNotificationTracker(processId, entitiesCount) {
        if (processId && entitiesCount && entitiesCount > 0) {
            this._notificationTracker[processId] = entitiesCount;
        }
    }

    /**
     * Function to start the timer to wait for notifications
     */
    _startNotificationTimer(processId) {
        //Wait for notification
        this.saveCompleteTimeout = setTimeout(() => {
            this._handleSaveSuccess(processId);
            clearTimeout(this.saveCompleteTimeout);
            this._loading = false;
        }, this.notificationWaitTimer);
    }

    /**
     * 	Handle next step after notification is received for all the records sent for updation
     */
    _isProcessCompleted(processId) {
        if (processId) {
            let activeApp = AppInstanceManager.getCurrentActiveApp();
            if (this._notificationTracker[processId] <= 0) {
                //If the timer is not yet reset, then page is still in loading, no changes can be made
                let performDirtyCheck = this.saveCompleteTimeout ? false : true;
                //Reset the save complete timer
                clearTimeout(this.saveCompleteTimeout);
                if (!ObjectUtils.isEmpty(this._erroredEntities[processId])) {
                    //Show an error toast for failed entities
                    let entityIds = _.pluck(this._erroredEntities[processId], 'id');
                    let errMsg = this.localize('RelMapFaiForEntMsg', { entityIds: entityIds });
                    this._handleSaveFailure(processId, errMsg);
                } else if (activeApp && activeApp.id == this.id) {
                    this._handleSaveSuccess(processId, performDirtyCheck);
                } else {
                    //show completion message on the notification badge if the current app is closed
                    this._notifyOnBadge({
                        description: this.localize('PreRelMapComMsg'),
                        paramData: {
                            appId: this.id,
                            appName: 'rock-relationship-mappings'
                        }
                    });
                }
                //After the process is completed, delete the _notificationTracker
                delete this._notificationTracker[processId];
            }
        }
    }

    /**
     * Function to handle save failure
     */
    _handleSaveFailure(processId, errorMsg) {
        let errMsg = errorMsg ? errorMsg : this.localize('RelMapFaiMsg');
        this._loading = false;
        //Delete the notification tracker
        delete this._notificationTracker[processId];
        //Show the Save fail message
        ToastManager.showErrorToast(errMsg);
    }

    /**
     * Function to handle save failure
     */
    _handleSaveSuccess(processId, performDirtyCheck) {
        this._loading = false;
        if (this._notificationTracker[processId] <= 0) {
            if (performDirtyCheck) {
                let isDirty = this.targetGrid.getIsDirty();
                if (isDirty) {
                    // Blink the refresh icon on the target grid
                    this.targetGrid.showNotificationBlinker();
                    ToastManager.showSuccessToast(this.localize('RelMapRldMsg'));
                    return;
                }
            }
            //Need to reload the grid with updated info
            this.targetGrid.reloadGrid();
            let saveMsg = this.localize('MapReqSavMsg');
            if (this._isGoverned) {
                saveMsg = this.localize('MapReqAppSavMsg');
            }
            ToastManager.showSuccessToast(saveMsg);
        } else {
            ToastManager.showWarningToast(this.localize('UpdReqDlyMsg'));
        }
    }

    /**
     * Function to handle mapped filter change
     */
    async handleMappedFilterChange(detail) {
        let gridType = detail?.configType;
        let mappedFilterId = detail?.mappedFilterId;
        let request = detail?.request;
        let searchText = detail?.searchText;
        this.mappedRelName = 'ismappedto';
        // When the user selects a value from show mapped filter, get the relationshipName from the targetgrid as we are building the relCriterion based on the relationship selected in target grid.
        const relationshipName = this.targetGrid?.getSelectedRelationship()?.relationshipName;
        this.mappedRelName = relationshipName ? relationshipName : this.mappedRelName;

        if (this.sourceGrid && this.targetGrid && !ObjectUtils.isEmpty(request)) {
            const sourceDomain = this.sourceGrid.getSelectedDomain();
            const sourceType = this.sourceGrid.getSelectedSource()?.id;

            const targetDomain = this.targetGrid.getSelectedDomain();
            const targetType = this.targetGrid.getSelectedSource()?.id;

            const targetContext = RelMappingHelper.createContextObj(this.targetGrid?._selectedContext);

            let items = [];
            if (sourceType && targetType) {
                //Get the grid items for source grid
                if (gridType == 'source') {
                    let sourceEntities = [];
                    let relToType = this.sourceGrid?.getSelectedSource()?.id;
                    let attributeName = '';
                    let targetEntityType = targetType;

                    if (sourceDomain?.hasClassifications) {
                        relToType = sourceDomain?.manageModelName;
                    }

                    if (targetDomain?.hasClassifications) {
                        targetEntityType = targetDomain?.manageModelName;
                        attributeName = targetDomain?.classificationAttributeName;
                    }

                    if (mappedFilterId == 'mapped') {
                        sourceEntities = await RelMappingHelper.getSourceMappedItems(
                            request,
                            this.mappedRelName,
                            relToType,
                            attributeName,
                            targetType,
                            searchText,
                            targetEntityType,
                            targetContext
                        );
                    } else if (mappedFilterId == 'unmapped') {
                        sourceEntities = await RelMappingHelper.getSourceUnMappedItems(
                            request,
                            this.mappedRelName,
                            relToType,
                            attributeName,
                            targetType,
                            searchText,
                            targetEntityType,
                            targetContext
                        );
                    } else {
                        const isSourceGrid = true;
                        sourceEntities = await RelMappingHelper.getItemsForGivenRequest(
                            request,
                            searchText,
                            isSourceGrid
                        );
                    }
                    //Format the obtained data as per the source grid config
                    items = await this.sourceGrid.getAttributeFormattedData(sourceEntities);
                    //Load the formatted data into the source grid
                    this.sourceGrid.loadGridWithGivenItems(items);
                } else {
                    let targetEntities = [];
                    request.params.fields['relationshipAttributes'] = [];
                    if (mappedFilterId == 'mapped') {
                        let relToType = sourceDomain.hasClassifications ? sourceDomain.manageModelName : sourceType;
                        targetEntities = await RelMappingHelper.getTargetMappedItems(
                            request,
                            this.mappedRelName,
                            relToType,
                            searchText,
                            targetContext
                        );
                    } else if (mappedFilterId == 'unmapped') {
                        targetEntities = await RelMappingHelper.getTargetUnMappedItems(
                            request,
                            this.mappedRelName,
                            searchText,
                            sourceDomain,
                            sourceType,
                            targetContext
                        );
                    } else {
                        // As we need to show all the entities (both mapped an unmapped) remove this criterion
                        delete request.params.query.filters.relationshipsCriterion;
                        targetEntities = await RelMappingHelper.getItemsForGivenRequest(request, searchText);
                    }
                    //Format the obtained data as per the target grid config
                    items = await this.targetGrid.getAttributeFormattedData(targetEntities);
                    //Load the formatted data into the target grid
                    this.targetGrid.loadGridWithGivenItems(items);
                }
            } else {
                //Showing a error msg to select proper source and target
                ToastManager.showErrorToast(this.localize('SelValSrcTarMsg'));
            }
        }
    }

    /**
     * Function to check if control is dirty
     */
    async handleControlIsDirty(detail) {
        let gridType = detail?.configType;
        let eventName = detail?.eventName;
        let isControlDirty = false;
        if (this.sourceGrid && this.targetGrid) {
            isControlDirty = this.sourceGrid.isShowMappedSelected() || this.targetGrid.isShowMappedSelected();
            if (gridType == 'source') {
                this.sourceGrid.performDirtyCheck(eventName, true, isControlDirty);
            } else {
                this.targetGrid.performDirtyCheck(eventName, true, isControlDirty);
            }
        }
    }

    /**
     * Function to update the target grid about the selected source
     */
    onSourceChange(detail) {
        let source = detail?.source;
        if (this.targetGrid) {
            this.targetGrid.updateUserSelectedSource(source);
        }
    }

    /**
     * Function to update the target grid about the selected domain
     */
    onDomainChange(detail) {
        let domain = detail?.domain;
        if (this.targetGrid) {
            this.targetGrid.updateUserSelectedDomain(domain);
        }
    }

    /**
     * Function to reset mapped filters and grid data of both the source and target grids
     */
    async onResetMappedFilters(detail) {
        if (this.sourceGrid && this.targetGrid) {
            this._loading = true;
            this.sourceGrid.resetMappedFilter();
            this.targetGrid.resetMappedFilter();
            if (detail?.gridToReload) {
                let gridType = detail?.gridToReload;
                if (gridType == 'source') {
                    await this.sourceGrid.reloadGrid();
                } else {
                    await this.targetGrid.reloadGrid();
                }
            }
        }
        this._loading = false;
    }

    async connectedCallback() {
        super.connectedCallback();
        let contextData = {};
        //Build the context data if not available
        if (ObjectUtils.isEmpty(this.contextData)) {
            let userContext = {
                roles: this.roles,
                user: this.userId,
                ownershipData: this.ownershipData,
                tenant: this.tenantId,
                defaultRole: this.defaultRole
            };
            contextData[ContextUtils.CONTEXT_TYPE_USER] = [userContext];
            this.contextData = contextData;
        } else {
            contextData = ObjectUtils.cloneObject(this.contextData);
        }
        this._isGoverned = await RelMappingHelper.getGovernFlag();

        this.requestConfig('rock-relationship-mappings', contextData);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    async onConfigLoaded(componentConfig) {
        if (componentConfig && componentConfig.config) {
            this.config = componentConfig.config;
            RelMappingHelper.setConfig(this.config);
        }
        this._readyToRender = true;
        this._loading = false;
        await this.updateComplete;
        this.setDropZone();
    }

    /**
     * Function to get the titlebar icon
     */
    _getTitleBarIcon() {
        return ComponentManager.getTitleBarIcon();
    }

    /**
     * Function to handle move right button click
     */
    _onMoveRightClick() {
        const sourceSelectedItems = this.sourceGrid?.grid?.selectedItems;
        const targetSelectedItem = this.targetGrid?.grid?.selectedItem;

        if (ObjectUtils.isEmpty(sourceSelectedItems) || ObjectUtils.isEmpty(targetSelectedItem)) {
            ToastManager.showErrorToast(this.localize('SelMinSrcTarMsg'));
            return;
        }

        sourceSelectedItems.forEach(async item => {
            let event = {};
            event.node = {};
            event.node.data = item;
            if (!ObjectUtils.isEmpty(event.node) && !ObjectUtils.isEmpty(targetSelectedItem)) {
                let overNode = {};
                overNode.data = targetSelectedItem;
                // For biz domain, the name will be inside an array
                if (Array.isArray(item.name)) {
                    item.name = ObjectUtils.isEmpty(item.name) ? item.id : item.name[0];
                }

                let newParentPath = [];
                let folderToDropInto = {};

                await this.targetGrid.updateSourceDataOnRowDragEnd(event, overNode, newParentPath, folderToDropInto);

                let updatedRows = [];

                // If the isMapped flag is not set as true, don't execute the following methods
                if (event.node.data.isMapped === true) {
                    this.targetGrid.moveToPath(newParentPath, event.node, updatedRows, false);
                    this.targetGrid.updateTargetGridOnRowDragEnd(updatedRows, this.targetGrid.dragDropGrid);
                }
            }
        });

        this._resetSourceAndTargetGridSelections();
    }

    /**
     * Function to deselect all the selected items of the source and target grid
     */
    _resetSourceAndTargetGridSelections() {
        this.sourceGrid.dragDropGrid.deSelectAll();
        this.targetGrid.dragDropGrid.deSelectAll();
    }

    /**
     * Function to set the drop zone
     */
    setDropZone() {
        let noOfGrids = this.shadowRoot.querySelectorAll('rock-drag-drop-grid');
        let dropGrid;
        let dragGrid;
        noOfGrids.forEach(grid => {
            if (grid.dropZone) {
                dropGrid = grid;
            } else {
                dragGrid = grid;
            }
        });
        if (dropGrid && dragGrid) {
            let interval = setInterval(() => {
                let dropZoneApi = dropGrid.getGridAPi();
                let dragZoneApi = dragGrid.getGridAPi();

                if (dropZoneApi && dragZoneApi) {
                    let dropZone = dropZoneApi.getRowDropZoneParams();
                    dragZoneApi.addRowDropZone(dropZone);
                    clearInterval(interval);
                }
            }, 200);
        }
    }

    /**
     * Function to show the pending mapping requests on click of Pending Request icon
     */
    _searchMappingRequest() {
        let filterData = RelMappingHelper.getFilterData(
            this.sourceGrid?.getSelectedSource().value,
            this.targetGrid?.getSelectedSource().value,
            this.sourceGrid?.getSelectedDomain(),
            this.targetGrid?.getSelectedDomain(),
            this.mappingRequestDomain
        );

        let mainApp = OSElements.mainApp;
        mainApp.setState(filterData);

        let state = mainApp.getQueryParamFromState();

        let action = this.aci.createAction({
            name: 'open-app-entity-search',
            detail: {
                queryParams: {
                    domain: this.mappingRequestDomain,
                    state: state
                }
            }
        });
        this.aci.dispatchGlobal(action);
    }

    _onDownload(event) {
        let targetGrid = this.targetGrid;
        let sourceGrid = this.sourceGrid;

        if (ObjectUtils.isEmpty(targetGrid?._selectedSource) || ObjectUtils.isEmpty(sourceGrid?._selectedSource)) {
            ToastManager.showErrorToast(this.localize('SelValSrcTarMsg'));
            event.stopPropagation();
            return;
        }

        let sourceEntityType = sourceGrid?._selectedSource?.id;
        let targetEntityType = targetGrid?._selectedSource?.id;
        let sourceDomain = sourceGrid?._selectedDomain;
        let targetDomain = targetGrid?._selectedDomain;
        let relationship =
            ObjectUtils.isEmpty(targetGrid._selectedRelationship) == false
                ? targetGrid?._selectedRelationship?.relationshipName
                : 'ismappedto';
        const targetContext = RelMappingHelper.createContextObj(this.targetGrid?._selectedContext);
        // If user has selected a business domain in target, then  the user has to select a relationship to export.
        if (!targetDomain.hasClassifications && ObjectUtils.isEmpty(targetGrid._selectedRelationship)) {
            ToastManager.showErrorToast(this.localize('SelRelMapTxt'));
            event.stopPropagation();
            return;
        }

        let sharedData = {
            sharedData: {
                source: sourceEntityType,
                target: targetEntityType,
                sourcedomain: sourceDomain?.id,
                targetdomain: targetDomain?.id,
                relationship: relationship
            }
        };

        if (!ObjectUtils.isEmpty(targetContext)) {
            sharedData.sharedData.contexts = targetContext;
        }
        DialogManager.openBusinessFunction(
            { name: 'plugin-wizard-relationship-mappings-download' },
            sharedData,
            this,
            this.contextData
        );
    }

    _onUpload() {
        let sharedData = {};
        DialogManager.openBusinessFunction(
            { name: 'plugin-wizard-relationship-mappings-upload' },
            sharedData,
            this,
            this.contextData
        );
    }
}

customElements.define('rock-relationship-mappings', RockRelationshipMappings);
