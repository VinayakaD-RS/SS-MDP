import { LitElement, html, css } from 'lit';
import { RufElement } from '@riversandtechnologies/ui-platform-elements/lib/base/ruf-element.js';
import { MixinManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/mixin-manager.js';
import { LoggerManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/logger-manager.js';
import { ToastManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/toast-manager.js';
import { styles as sharedStyles } from '@riversandtechnologies/ui-platform-elements/lib/flow/core/base/shared.element.css.js';
import { getCustomStylesForLit } from '@riversandtechnologies/ui-platform-elements/lib/utils/getCustomStylesForLit.js';
import { AppInstanceManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/app-instance-manager.js';
import { ObjectUtils } from '@riversandtechnologies/ui-platform-utils/lib/common/ObjectUtils.js';
import { UniqueIdUtils } from '@riversandtechnologies/ui-platform-utils/lib/common/UniqueIdUtils.js';
import { Constants } from '@riversandtechnologies/ui-platform-utils/lib/mdm/Constants.js';
import ComponentConfigBase from '@riversandtechnologies/ui-platform-business-elements/lib/base/component-config-base.js';
import DataRequestHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/DataRequestHelper.js';
import { DataObjectManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/DataObjectManager.js';
import { DialogManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/dialog-manager.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-spinner/pebble-spinner.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-dialog/pebble-dialog.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/bedrock-grid/bedrock-grid.js';
import EditableGridBase from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/EditableGridBase.js';
import { OSElements } from '@riversandtechnologies/ui-platform-elements/lib/base/os-elements.js';

import GrmAttributeModelHelper from '../../helpers/GrmAttributeModelHelper.js';
import './pebble-icon-textbox.js';
import './rock-manage-merge-model-scope.js';

class RockAdaptiveMergeModelManage extends MixinManager(LitElement).with(RufElement, ComponentConfigBase, EditableGridBase) {
    render() {
        return html`
            <pebble-spinner .active=${this._loading}></pebble-spinner>
            <div class="layout-container">
                ${this._gridDataReady
                    ? html`
                          <bedrock-grid
                              id="adaptiveMergeModelGrid"
                              .columns=${this.gridColumns}
                              .config=${this.gridConfig}
                              .options=${this.gridOptions}
                              .isRowSelectableOnBulkEdit=${true}
                              .hideViewSelector="${true}"
                              .multiSelect="${false}"
                              .showSelectAllCheckbox="${false}"
                              .pageSize="${this.pageSize}"
                              .showEmptyMessage="${this._isGridDataEmpty}"
                              .emptyMessage="${this.gridInfo}"
                              .isRowSelectable="${true}"
                              user-view-mode="Tabular"
                              .editEnabled=${true}
                              .items="${this.gridData}"
                              .hideLastRefreshedTimestamp=${true}
                          ></bedrock-grid>
                      `
                    : html``}

                ${this._getManageScopeDialogTemplate()}
                ${this._getManageMergeModelDialogTemplate()}
            </div>
        `;
    }

    _getManageScopeDialogTemplate() {
        return html`
            <pebble-dialog
                id="manageScope"
                .dialogTitle=${this.localize('ManMerModCriTxt')}
                .modal=${true}
                .noCancelOnOutsideClick=${true}
                .noCancelOnEscKey=${true}
                .showCloseIcon=${true}
                .windowMode=${true}
                .medium=${true}
                .alertBox=${true}
                .showCancel=${false}
                @close-clicked=${this._closeHandler}
                .contextData=${this.contextData}
            >
                <div class="manage-scope" id="manageScopeDialogContent">
                    
                </div>
            </pebble-dialog>
        `;
    }

    _getManageMergeModelDialogTemplate() {
        return html`
            <pebble-dialog
                id="manageMergeModel"
                .dialogTitle=${this.localize('ManMerModTxt')}
                .modal=${true}
                .noCancelOnOutsideClick=${true}
                .noCancelOnEscKey=${true}
                .showCloseIcon=${true}
                .windowMode=${true}
                .medium=${true}
                .alertBox=${true}
                .showCancel=${false}
                @close-clicked=${this._closeHandler}
                .contextData=${this.contextData}
            >
                <div id="manageMergeModelDialogContent">
                    
                </div>
            </pebble-dialog>
        `;
        
    }

    static get styles() {
        const customStyles = getCustomStylesForLit(['bedrock-style-scroll-bar', 'bedrock-style-grid-layout']);
        const localStyles = css`
            :host {
                --ag-grid-clipper-transform: none;
            }
            .layout-container {
                height: 40vh;
            }
        `;
        return [...customStyles, sharedStyles, localStyles];
    }

    static get properties() {
        return {
            mergeModelId: { type: String },
            contextData: { type: Object, reflect: true },
            entityType: { type: String },
            _loading: { type: Boolean },
            _notificationTracker: { type: Object },
            adaptiveMergeModels: {type: Array},

            //Grid properties
            gridConfig: { type: Object },
            gridOptions: { type: Object },
            gridColumns: { type: Array },
            gridData: { type: Array },
            rowData: { type: Object },
            _gridDataReady: { type: Boolean },
            gridInfo: { type: String },
            _isGridDataEmpty: { type: Boolean },

            actions: { type: Object },
            attributeModels: { type: Object },
            _deletedRows: { type: Array },
            _isTrustScoreEmpty: { type: Boolean },

            qualifiers: { type: Array }
        };
    }

    constructor() {
        super();
        this.mergeModelId = '';
        this.entityType = '';
        this.contextData = {};
        this._loading = false;
        this._notificationTracker = {};
        this.adaptiveMergeModels = [];

        //Grid Properties
        this.gridConfig = {};
        this.gridOptions = {};
        this.gridColumns = [];
        this.gridData = [];
        this.rowData = {};
        this._gridDataReady = false;
        this.gridInfo = '';
        this._isGridDataEmpty = true;

        this.attributeModels = GrmAttributeModelHelper.getAdaptiveMergeAttributeModel();

        this.actions = {
            'grid-toolbar-action-custom-toolbar-event': {
                name: 'grid-toolbar-action-custom-toolbar-event'
            },
            'govern-complete': {
                name: 'govern-complete'
            },
            'icon-textbox-edit-click': {
                name: 'icon-textbox-edit-click'
            },
            'scope-updated': {
                name: 'scope-updated'
            }
        };
        this._deletedRows = [];
        this._isTrustScoreEmpty = false;

        this.qualifiers = [];
    }

    async actionCallback(actionName, detail) {
        switch (actionName) {
            case 'govern-complete':
                this._onModelSavedNotificationReceived(detail);
                break;
            case 'grid-toolbar-action-custom-toolbar-event': {
                this._onToolbarEvent(detail);
                break;
            }
            case 'icon-textbox-edit-click': {
                this._onScopeEditClick(detail);
                break;
            }
            case 'update-scope': {
                this._updateScope(detail);
                break;
            }

            default:
                break;
        }
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        super.attributeChangedCallback(name, oldVal, newVal);
        this._onAttributeChanged(name);
    }

    _onAttributeChanged(propertyName) {
        switch (propertyName) {
            case 'contextdata':
                this._onContextDataChange();
                break;

            default:
                break;
        }
    }

    _onContextDataChange() {
        if (!ObjectUtils.isEmpty(this.contextData)) {
            this.requestConfig('rock-adaptive-merge-model-manage', this.contextData);
        }
    }

    async onConfigLoaded(componentConfig) {
        if (componentConfig && !ObjectUtils.isEmpty(componentConfig.config)) {
            this.gridConfig = componentConfig.config.gridConfig;
            await this._onLoadAdaptiveMergeModel();
        }
    }

    get adaptiveMergeModelGrid() {
        return this.shadowRoot.querySelector('#adaptiveMergeModelGrid');
    }
    get manageScopeDialog() {
        return this.shadowRoot.querySelector('#manageScope');
    }
    get manageMergeModelDialog() {
        return this.shadowRoot.querySelector('#manageMergeModel');
    }

    /**
     * Function to load the merge models by preparing the grid columns
     */
    async _onLoadAdaptiveMergeModel() {
        this._loading = true;

        if (!ObjectUtils.isEmpty(this.gridConfig)) {
            this.gridOptions = this.getGridOptions();
            let gridColRowDataObj = this.getGridColumnsRowData(this.gridConfig, this.attributeModels, this.contextData);
            this.rowData = gridColRowDataObj && gridColRowDataObj.rowData ? gridColRowDataObj.rowData : {};
            const gridColumns = gridColRowDataObj && gridColRowDataObj.gridColumns ? gridColRowDataObj.gridColumns : [];
            this.gridColumns = this.setCellRendererParams(gridColumns);
        }
        await this._populateGridData();
    }

    /**
     * When the scope has been updated in the manage scope grid. The same should be updated in the merge model. This method takes care of it.
     */
    _updateScope(detail) {
        const scope = detail?.scope;
        const modelId = detail?.modelId;

        const mergeModel = this.adaptiveMergeModels.find(item => item.id === modelId);
        mergeModel.data.jsonData.scope = {...scope};

        if (this.manageScopeDialog) {
            this._closeHandler();
        }

        // to see the changes update the grid.
        this._loadScopeGrid();
    }

    _closeHandler() {
        if (this.manageScopeDialog) {
            this.manageScopeDialog.close();
        }
    }

    /**
     * @returns updated grid columns with custom params defined based on column name 
     */
    setCellRendererParams(gridColumns) {
        this.gridOptions.customCellRenderers = {
            pebbleIconTextBox: 'pebble-icon-textbox'
        };

        gridColumns.forEach(colItem => {
            if (colItem.field === 'scope') {
                colItem.cellRenderer = 'pebbleIconTextBox';
                colItem.editable = false;
                colItem.cellRendererParams = params => {
                    if (params.data) {
                        return {
                            cellId: params.data.id,
                            icon: 'pebble-icon:edit',
                            text: params.data.scope
                        };
                    }
                };
            }
        });

        return gridColumns;
    }

    /**
     * Open dialog to manage scope.
     */
    _onScopeEditClick(detail) {

        const mergeModelId = detail?.id;
        const selectedMergeModel = this.adaptiveMergeModels.find(item => item.id === mergeModelId);
        const selectedMergeModelScope = selectedMergeModel?.data?.jsonData?.scope;
        const selectedMergeModelId = selectedMergeModel?.id;

        if (this.manageScopeDialog) {
            let component = {
                name: 'rock-manage-merge-model-scope',
                path: './rock-manage-merge-model-scope.js',
                properties: {
                    contextData: this.contextData,
                    qualifiers: this.qualifiers,
                    entityType: this.entityType,
                    scope: selectedMergeModelScope,
                    modelId: selectedMergeModelId
                }
            };
            OSElements.dynamicComponentManager.loadComponent(
                this.manageScopeDialog.querySelector('#manageScopeDialogContent'),
                component,
                this
            );
            this.manageScopeDialog.open();
        }
    }

    /**
     * Function to prepare grid data
     */
    async _populateGridData() {
        //Reset the deleted rows
        this._deletedRows = [];
        this.gridData = [];
        const adaptiveMergeModels = ObjectUtils.isEmpty(this.adaptiveMergeModels) ? await this._getMergeModels(): this.adaptiveMergeModels;

        if (!ObjectUtils.isEmpty(adaptiveMergeModels)) {
            const gridColumns = _.pluck(this.gridColumns, 'field');
            const modelList = this._getFormattedModelList(adaptiveMergeModels);
            //Build the gridData
            for (const model of modelList) {
                const rowData = this.getNewRowData(this.rowData);
                rowData.id = model.id;
                for(const col of gridColumns) {
                    rowData[col] = model[col];
                    rowData.attributes[col].value = model[col]; 
                }
                rowData.originalAttributes = ObjectUtils.cloneObject(rowData.attributes);
                this.gridData.push(rowData);
            }
        }

        //Show empty row if no scopes are defined
        if (ObjectUtils.isEmpty(this.gridData)) {
            const emptyRowData = this.getNewRowData(this.rowData);
            this.gridData.push(emptyRowData);
        }

        this._loading = false;
        this._isGridDataEmpty = false;
        this._gridDataReady = true;
    }

    /**
     * @returns a formatted list containing the merge model data required for the grid.
     */
    _getFormattedModelList(adaptiveMergeModels){
        let formattedMergeModels = [];
        
        for(const mergeModel of adaptiveMergeModels) {
            const properties = mergeModel.properties;
            const modelId = mergeModel.id;
            const modelName = mergeModel.name;
            const scope = mergeModel?.data?.jsonData?.scope;
            const formattedScope =  this._getFormattedScope(scope);
            const rank =  properties?.rank;
            const enabled =  properties?.enabled;

            const mergeModelObj = {
                id: modelId,
                modelName: modelName,
                scope: formattedScope,
                rank: rank,
                enabled: enabled
            } 
            formattedMergeModels.push(mergeModelObj)
        }

        return formattedMergeModels;
    }

    /**
     * @returns formatted string which contains the scope data.
     * Ex - categoryPath = Electronics
     */
    _getFormattedScope(scope){
        if(ObjectUtils.isEmpty(scope)){
            return "";
        }

        let formattedScope = "";

        for (const criteria in scope) {
            const qualifier = scope[criteria];
            for (const value in qualifier) {
                if(!ObjectUtils.isEmpty(formattedScope)){
                    formattedScope = formattedScope.concat(" || ")
                }
                formattedScope = formattedScope.concat(`${criteria} = ${qualifier[value]}`);
            }
        }

        return formattedScope;
    }

    /**
     * Function to get the merge model attributes
     */
    async _getMergeModels() {
        this.adaptiveMergeModels = await GrmAttributeModelHelper.getMergeModels(this.entityType);
        return this.adaptiveMergeModels;
    }

    /**
     * Handle grid toolbar events like refresh, add, delete, save
     */
    async _onToolbarEvent(detail) {
        if (detail && detail.actionInfo) {
            if (detail.actionInfo.name == 'refreshMergeModel') {
                this._isToolbarRefresh = true;
                this.refresh();
            } else if (detail.actionInfo.name == 'addMergeModel') {
                this.addNewRow(this.adaptiveMergeModelGrid, this.rowData);
            } else if (detail.actionInfo.name == 'editMergeModel') {
                this._loadManageMergeModelDialog();
            } else if (detail.actionInfo.name == 'deleteMergeModel') {
                let deletedRows = this.deleteRows(this.adaptiveMergeModelGrid);
                //If duplicate check is there on the deleted row, remove the other duplicate ro from the grid
                this.duplicateCheckonGivenColumn('', 'attributeName', {}, this.adaptiveMergeModelGrid, true);
                this._deletedRows = this._deletedRows.concat(deletedRows);
            } else if (detail.actionInfo.name == 'saveMergeModel') {
                this._onSave();
            }
        }
    }

    /**
     * Using dynamicComponentManager, this method loads the merge model manage component in a dialog
     */
    _loadManageMergeModelDialog(){
        const selectedMergeModelId = this.adaptiveMergeModelGrid?.selectedItem?.id;
        const selectedMergeModel = this.adaptiveMergeModels.find(item => item.id === selectedMergeModelId);

        if(!selectedMergeModelId) {
            ToastManager.showWarningToast(this.localize("SelAtlOneModTxt"))
            return;
        }
        
        if (this.manageMergeModelDialog) {
            let component = {
                name: 'rock-merge-model-manage',
                path: './rock-merge-model-manage.js',
                properties: {
                    contextData: this.contextData,
                    entityType: this.entityType,
                    adaptiveMergeModel: selectedMergeModel
                }
            };
            OSElements.dynamicComponentManager.loadComponent(
                this.manageMergeModelDialog.querySelector('#manageMergeModelDialogContent'),
                component,
                this
            );
            this.manageMergeModelDialog.open();
        }
    }

    /**
     * Handle grid toolbar refresh click
     */
    async refresh(isDirtyCheckHandled) {
        if (isDirtyCheckHandled) {
            await this.reloadGrid();
        } else {
            let isDirty = this.getIsDirty();
            if (isDirty) {
                DialogManager.openConfirm(this);
            } else {
                await this.reloadGrid();
            }
        }
    }

    /**
     * Initialize the grid properties and reload the grid
     */
    async reloadGrid() {
        this.initGridAttributes();
        await this._onLoadAdaptiveMergeModel();
    }

    /**
     * Confirm Dialog Handler
     */
    confirmDialogHandler(confirmStatus) {
        if (confirmStatus) {
            if (this._isToolbarRefresh) {
                this._isToolbarRefresh = false;
                this.refresh(true);
            }
        }
    }

    /**
     * Function to provide dirty check
     */
    getIsDirty() {
        if (!ObjectUtils.isEmpty(this.adaptiveMergeModelGrid)) {
            let changedData = this.adaptiveMergeModelGrid.getChangedData();

            //If the rows are edited and/or deleted, then the grid is dirty
            if (!ObjectUtils.isEmpty(changedData) || !ObjectUtils.isEmpty(this._deletedRows)) {
                return true;
            }
        }
        return false;
    }


    /**
     * Function to check if the grid data has errors
     */
    _validateData(gridData) {
        let isValid = true;
        if (!ObjectUtils.isEmpty(gridData)) {
            //Check for required fields
            isValid = _.find(gridData, function (item) {
                return !item['primaryStrategy'];
            })
                ? false
                : true;
            if (!isValid) {
                ToastManager.showErrorToast(this.localize('ProPriStrMsg'));
                return isValid;
            }
            //Check if primary and fallback stratery are same then show a warning toast
            let samePrimaryFallbackStr = _.find(gridData, function (item) {
                return item['primaryStrategy'] == item['fallbackStrategy'];
            })
                ? true
                : false;
            if (samePrimaryFallbackStr) {
                ToastManager.showWarningToast(this.localize('PriFalStrMsg'));
            }
            //Check for validation errors in the grid
            isValid = this.checkForGridErrors(gridData);
            if (!isValid) {
                ToastManager.showErrorToast(this.localize('ModSavValMsg'));
                return isValid;
            }
        }
        return isValid;
    }

    /**
     *  Function to handle Save button click
     */
    async _onSave() {
        if (this.adaptiveMergeModelGrid) {
            this.adaptiveMergeModelGrid.stopEditing();

            //Introducting a min timeout to let grid stopEditing and detect grid data change
            this.saveCompleteTimeout = setTimeout(async () => {
                if (!this.getIsDirty()) {
                    ToastManager.showInformationToast(this.localize('TstNoCha'));
                    return;
                }
                //Validate the grid data
                let gridData = this.adaptiveMergeModelGrid.getChangedData();
                let isValid = this._validateData(gridData);
                if (isValid) {
                    this._loading = true;
                    let mergeModel = this._buildMergeModel(gridData);
                    await this._triggerMergeModelSave(mergeModel);
                }
                clearTimeout(this.saveCompleteTimeout);
            }, Constants.MILLISECONDS_10);
        }
    }

    /**
     * Function to build the merge model
     */
    _buildMergeModel(gridData) {
        let mergeModelAttributes = this._buildMergeModelAttributes(gridData);

        //build the deleted attributes
        if (!ObjectUtils.isEmpty(this._deletedRows)) {
            let deletedMergeModelAttributes = this._buildMergeModelAttributes(this._deletedRows);
            for (let key in deletedMergeModelAttributes) {
                deletedMergeModelAttributes[key].action = 'delete';
            }
            mergeModelAttributes = { ...mergeModelAttributes, ...deletedMergeModelAttributes };
        }

        let mergeModel = {
            entityModels: [
                {
                    id: !ObjectUtils.isEmpty(this.adaptiveMergeModels)
                        ? this.adaptiveMergeModels.id
                        : this.entityType + '_mergeModel',
                    type: !ObjectUtils.isEmpty(this.adaptiveMergeModels) ? this.adaptiveMergeModels.type : 'mergeModel',
                    name: !ObjectUtils.isEmpty(this.adaptiveMergeModels)
                        ? this.adaptiveMergeModels.name
                        : this.entityType + '_mergeModel',
                    data: {
                        attributes: mergeModelAttributes
                    }
                }
            ]
        };

        return mergeModel;
    }

    /**
     * Function to build the merge model attributes
     */
    _buildMergeModelAttributes(gridData) {
        let mergeModelAttributes = {};
        if (!ObjectUtils.isEmpty(gridData)) {
            gridData.forEach(item => {
                let mergeModelAttribute = this._buildMergeModelAttributeFromGridItem(item, 'attributes');
                //If the originalAttribute was edited with new attribute name, then delete the originalAttribute
                if (
                    ObjectUtils.isValidObjectPath(item, 'originalAttributes.attributeName.selectedReferenceDataId') &&
                    ObjectUtils.isValidObjectPath(item, 'attributes.attributeName.selectedReferenceDataId') &&
                    item.originalAttributes.attributeName.selectedReferenceDataId != '' &&
                    item.originalAttributes.attributeName.selectedReferenceDataId !=
                        item.attributes.attributeName.selectedReferenceDataId
                ) {
                    let orgAttributeKey = this.getAttributeNameFromReferenceData(
                        item.originalAttributes.attributeName.selectedReferenceDataId
                    );
                    let orgMergeModelAttribute = this._buildMergeModelAttributeFromGridItem(item, 'originalAttributes');
                    orgMergeModelAttribute[orgAttributeKey].action = 'delete';
                    mergeModelAttribute = { ...mergeModelAttribute, ...orgMergeModelAttribute };
                }

                mergeModelAttributes = { ...mergeModelAttributes, ...mergeModelAttribute };
            });
        }
        return mergeModelAttributes;
    }

    /**
     * Function to build the merge model attribute for given type i.e attributes or originalattributes
     */
    _buildMergeModelAttributeFromGridItem(item, type) {
        let mergeModelAttribute = {};
        type = type ? type : 'attributes';
        if (!ObjectUtils.isEmpty(item)) {
            if (ObjectUtils.isValidObjectPath(item[type], 'attributeName.selectedReferenceDataId')) {
                let attributeKey = this.getAttributeNameFromReferenceData(
                    item[type].attributeName.selectedReferenceDataId
                );
                mergeModelAttribute[attributeKey] = {
                    properties: {}
                };
                if (ObjectUtils.isValidObjectPath(item[type], 'primaryStrategy.selectedReferenceDataId')) {
                    mergeModelAttribute[attributeKey].properties.strategy =
                        item[type].primaryStrategy.selectedReferenceDataId;
                }
                if (ObjectUtils.isValidObjectPath(item[type], 'mergeGroupId.selectedReferenceDataId')) {
                    mergeModelAttribute[attributeKey].properties.mergeGroupId =
                        item[type].mergeGroupId.selectedReferenceDataId;
                }
                if (ObjectUtils.isValidObjectPath(item[type], 'fallbackStrategy.selectedReferenceDataId')) {
                    mergeModelAttribute[attributeKey].properties.fallback = [
                        {
                            strategy: item[type].fallbackStrategy.selectedReferenceDataId
                        }
                    ];
                }
            }
        }

        return mergeModelAttribute;
    }

    /**
     * Trigger merge model save request
     */
    async _triggerMergeModelSave(requestData) {
        if (ObjectUtils.isEmpty(requestData)) {
            LoggerManager.logError(this, 'Merge Model Save Request is Empty ', requestData);
            return;
        }

        //Set client info
        let currentActiveApp = AppInstanceManager.getCurrentActiveApp();
        const processId = UniqueIdUtils.generateUUID();
        let clientStateInfo = {};
        clientStateInfo.updateCacheIds = [
            this.getConfigId('rock-merge-model-manage', ObjectUtils.cloneObject(this.contextData))
        ];
        let dalReqOptions = DataRequestHelper.getDALOptionsForConfigUpdate(
            requestData,
            clientStateInfo,
            'rock-merge-model-manage'
        );
        //Setting entity Model in index manually to send update request for model and not config
        dalReqOptions.dataIndex = 'entityModel';

        if (ObjectUtils.isValidObjectPath(dalReqOptions, 'clientStateInfo.notificationInfo.context')) {
            dalReqOptions.clientStateInfo.notificationInfo.context.appName = currentActiveApp.id;
            dalReqOptions.clientStateInfo.notificationInfo.context.processId = processId;
        }

        if (!dalReqOptions.clientStateInfo.notificationInfo.badgeNotificationInfo) {
            dalReqOptions.clientStateInfo.notificationInfo.badgeNotificationInfo = {
                messageCode: 'PreMerCriSavComMsg',
                navigationParams: {
                    appName: currentActiveApp.id
                }
            };
        }

        this._notificationTracker[processId] = 1;
        let saveRequest = DataObjectManager.createRequest('update', requestData, '', dalReqOptions);
        let saveResponse = await DataObjectManager.initiateRequest(saveRequest);
        if (saveResponse && saveResponse.response && saveResponse.response.status == 'success') {
            this._onSaveSubmissionComplete();
        } else {
            ToastManager.showErrorToast(this.localize('ProFaiMsg'));
            delete this._notificationTracker[processId];
        }
    }

    /**
     *  Start notification timer
     */
    _onSaveSubmissionComplete() {
        this._loading = true;
        //Refresh the grid with current data
        this._deletedRows = [];
        this.removeChangedDataAndRefreshGrid(this.adaptiveMergeModelGrid, this.rowData);
        this.notificationTimer = setTimeout(() => {
            //If the notification is not received within 10s, show toast
            if (!ObjectUtils.isEmpty(this._notificationTracker)) {
                ToastManager.showWarningToast(this.localize('OpeWaiRefMsg'));
            }
            clearTimeout(this.notificationTimer);
            this._loading = false;
        }, Constants.MILLISECONDS_10000);
    }

    /**
     * Function to handle model save success
     */
    async _onModelSavedNotificationReceived(detail) {
        let data = detail.data;
        clearTimeout(this.notificationTimer);
        this._loading = false;

        //Handle notifications
        if (ObjectUtils.isValidObjectPath(data, 'context.processId') && !ObjectUtils.isEmpty(data.context.processId)) {
            let processId = data.context.processId;
            if (this._notificationTracker[processId]) {
                delete this._notificationTracker[processId];
                ToastManager.showSuccessToast(this.localize('PreMerCriSavComMsg'));
                const showBlinker = this.aci.createAction({
                    name: 'entity-manage-refresh-action-blink'
                });
                this.aci.dispatch(showBlinker);
            }
        }
    }
}

customElements.define('rock-adaptive-merge-model-manage', RockAdaptiveMergeModelManage);
