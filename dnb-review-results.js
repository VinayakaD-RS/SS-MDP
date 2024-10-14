//dnb identification ref data not selected in lov in entity manage
import { LitElement, html, css } from 'lit-element/lit-element.js';

import '@riversandtechnologies/ui-platform-elements/lib/styles/bedrock-style-common.js';
import '@riversandtechnologies/ui-platform-elements/lib/styles/bedrock-style-flex-layout.js';
import '@riversandtechnologies/ui-platform-elements/lib/styles/bedrock-style-icons.js';
import '@riversandtechnologies/ui-platform-elements/lib/styles/bedrock-style-gridsystem.js';
import '@riversandtechnologies/ui-platform-elements/lib/styles/bedrock-vertical-divider.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-spinner/pebble-spinner.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-icon/pebble-icon.js';
import { MixinManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/mixin-manager.js';
import { RufElement } from '@riversandtechnologies/ui-platform-elements/lib/base/ruf-element.js';
import { styles as sharedStyles } from '@riversandtechnologies/ui-platform-elements/lib/flow/core/base/shared.element.css.js';
import { getCustomStylesForLit } from '@riversandtechnologies/ui-platform-elements/lib/utils/getCustomStylesForLit.js';
import { QueryParamsUtils } from '@riversandtechnologies/ui-platform-elements/lib/utils/QueryParamsUtils.js';
import { PubSubManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/pubsub-manager.js';
import { ToastManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/toast-manager.js';
import '@riversandtechnologies/ui-platform-elements/lib/styles/bedrock-style-grid-layout.js';
import { LoggerManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/logger-manager.js';

import ComponentConfigBase from '@riversandtechnologies/ui-platform-business-elements/lib/base/component-config-base.js';
import DataRequestHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/DataRequestHelper.js';
import DataTransformHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/DataTransformHelper.js';
import NotificationHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/NotificationHelper.js';

import { ContextUtils } from '@riversandtechnologies/ui-platform-utils/lib/mdm/ContextUtils.js';
import { ObjectUtils } from '@riversandtechnologies/ui-platform-utils/lib/common/ObjectUtils.js';
import { AttributeUtils } from '@riversandtechnologies/ui-platform-utils/lib/mdm/AttributeUtils.js';

import { DataObjectManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/DataObjectManager.js';
import { EntityCompositeModelManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/EntityCompositeModelManager.js';
import { DALCommonUtils } from '@riversandtechnologies/ui-platform-dataaccess/lib/utils/DALCommonUtils.js';
import { AppConstants } from '../../helpers/AppConstants';
import { DNBHelper } from '../../helpers/DNBHelper';
class PluginDNBResultReview extends MixinManager(LitElement).with(RufElement, ComponentConfigBase) {
    static get properties() {
        return {
            contextData: {
                type: Object
            },
            dnbReviewGridConfig: {
                type: Object
            },
            entityGridConfig: {
                type: Object
            },
            _entityDNBStatusAttribute: {
                type: String
            },
            _entityGRMStateAttribute: {
                type: String
            },
            _loading: {
                type: Boolean
            },
            _message: {
                type: String
            },
            _dnbReviewGridColumns: {
                type: Array
            },
            _dnbReviewGridItems: {
                type: Array
            },
            _nestedGridColumns: {
                type: Array
            },
            _nestedGridItems: {
                type: Array
            },
            _isBulkProcess: {
                type: Boolean
            },
            _dnbReviewResultsContextId: {
                type: String
            },
            _selectedEntities: {
                type: Array
            },
            _currentIndex: {
                type: Number
            },
            _reviewStatus: {
                type: String
            },
            _reviewEntities: {
                type: Array
            },
            _isConfigLoaded: {
                type: Boolean
            },
            _selectedDNBResult: {
                type: Object
            },
            _isDNBProcessValid: {
                type: Boolean
            },
            _currentEntityName: {
                type: String
            },
            _actionCompletedMessage: {
                type: String
            },
            _actionStatus: {
                type: String
            },
            _continueButtonClass: {
                type: String
            },
            _dnbGenericObjectResponse: {
                type: Array
            },
            //Accordion Properties
            _activeAccordions: { type: Array },
            _reviewAccordionHeaderName: { type: String }
        };
    }

    static get styles() {
        let localStyles = css`
            .grid-container {
                width: 100%;
                height: 100%;
                position: relative;
                overflow: auto;
            }

            #entityGridAccordion {
                max-height: 25%;
            }
            #reviewGridAccordion {
                max-height: 65%;
            }

            .nested-content {
                overflow-y: auto;
                overflow-x: auto;
                height: 50vh;
            }

            .window-confirm-dialog {
                --pebble-dialog-top-position: 40%;
                --pebble-dialog-width: 50%;
                text-align: justify;
            }

            .actions-placeholder {
                top: 0px;
                right: 0px;
                height: 30px;
                display: flex;
                align-items: center;
                padding: 0px 18px;
                z-index: 1;
                background: rgb(255, 255, 255);
                justify-content: flex-end;
            }

            .bulk-process-move-to-next-button {
                margin: 4px 0px 8px 0px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
            }

            .summary-badge {
                cursor: pointer;
                position: relative;
                margin-left: 8px;
                --pebble-badge-height: 14px;
                --pebble-badge-padding-left: 5px;
                --pebble-badge-padding-right: 5px;
            }

            .popover-summary-list {
                --default-popup-t-p: 10px;
                --default-popup-b-p: 10px;
                --min-width-popover: 300px;
            }

            .vertical-divider {
                --vertical-divider-height: 24px;
                --vertical-divider-width: 2px;
                --vertical-divider-color: #c1cad4;
                margin: 0 0 0 10px;
            }

            .button-divider {
                margin-left: 0 0 0 10px;
            }

            .next-button {
                height: 18px !important;
                --pebble-button-icon-height: 10px;
                --pebble-button-min-width: 24px;
                --pebble-button-height: 16px;
            }

            .widget-box {
                padding: 0px 18px 0px 8px;
                max-height: 120px;
                overflow: auto;
                display: flex;
                align-items: center;
                font-size: 14px;
            }

            .summary-popup-title {
                padding-left: 8px;
                font-size: 14px;
                font-weight: 500;
                text-align: left;
            }

            .content-status-message {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                flex: 1 1 100%;
                font-size: 12px;
            }

            .content-status-message .content-status-message--row {
                display: flex;
            }

            .status-info {
                padding: 4px 0px 4px 8px;
                color: rgb(0, 0, 0);
                display: flex;
                flex-basis: 25%;
                flex-grow: 0px;
                flex-shrink: 0px;
            }

            .status-info:last-child {
                padding-right: 8px;
            }

            .status-info span {
                margin-left: 4px;
                margin-right: 4px;
            }

            .merge-count {
                color: rgb(66, 190, 101);
            }

            .ignore-count {
                color: rgb(69, 137, 255);
            }

            .skipped-count {
                color: rgb(255, 131, 43);
            }
        `;
        const customStyles = getCustomStylesForLit([
            'bedrock-style-common',
            'bedrock-style-padding-margin',
            'bedrock-style-buttons',
            'bedrock-style-scroll-bar',
            'bedrock-style-grid-layout',
            'bedrock-vertical-divider'
        ]);
        return [...customStyles, localStyles, sharedStyles];
    }

    render() {
        return html`
            <pebble-spinner .active=${this._loading}></pebble-spinner>
            <div class="base-grid-structure">
                <div class="base-grid-structure-child-1">
                    <div class="actions-placeholder">
                        ${this._isBulkProcess
                            ? html` <pebble-badge
                                      title="${this.localize('ShoTxt')} ${this.localize('SumTit')}"
                                      class="summary-badge m-l-10"
                                      label="${this._reviewStatus}"
                                      id="summary-list"
                                      label="0"
                                      @click="${this.showSummaryList}"
                                  ></pebble-badge>
                                  <pebble-button
                                      class="next-button action-button btn btn-secondary m-l-10"
                                      id="next"
                                      icon="pebble-icon:action-scope-take-selection"
                                      title=${this.localize('MovToNxtTxt')}
                                      raised
                                      @tap="${this._onNextTap}"
                                  ></pebble-button>`
                            : ``}
                        ${this._isDNBProcessValid
                            ? html`
                                  <div class="button-divider vertical-divider" ?hidden=${!this._isBulkProcess}></div>
                                  <!--pebble-button
                                      class="action-button-focus dropdownText btn btn-primary m-l-10"
                                      id="ignore"
                                      button-text="${this.localize('IgnTxt')}"
                                      raised
                                      @tap="${this._onIgnoreTap}"
                                  ></pebble-button-->
                                  <pebble-button
                                      class="action-button-focus dropdownText btn ${this._continueButtonClass} m-l-10"
                                      id="continueWithoutDunsBtn"
                                      .buttonText="${this.localize('ConWitDNBIdeTxt')}"
                                      raised
                                      @tap="${this._onContinueWithoutDunsTap}"
                                  ></pebble-button>
                                  <pebble-button
                                      class="action-button-focus dropdownText btn btn-success m-l-10"
                                      id="merge"
                                      .buttonText="${this.localize('ConIdeTxt')}"
                                      raised
                                      @tap="${this._onMergeTap}"
                                      ?disabled="${ObjectUtils.isEmpty(this._selectedDNBResult)}"
                                  ></pebble-button>
                              `
                            : ``}
                    </div>
                    ${this._message ? html`<div class="default-message">${this._message}</div>` : ``}
                </div>
                <div class="base-grid-structure-child-2">
                    ${this._isDNBProcessValid
                        ? html`
                              <pebble-accordion-group-lit
                                  class="full-height"
                                  .activeAccordions=${this._activeAccordions}
                                  .openMultiAccordion=${true}
                                  old-accordion
                                  slot="pebble-card-content"
                              >
                                  <pebble-accordion
                                      id="entityGridAccordion"
                                      .isCollapsed=${false}
                                      .headerText=${this.localize('DNBInqCriTxt')}
                                  >
                                      <div slot="accordion-content" class="grid-container">
                                          ${!ObjectUtils.isEmpty(this._entityDetails)
                                              ? html`<pebble-grid
                                                    id="entityGrid"
                                                    .columns=${this._entityGridColumns}
                                                    .gridData=${this._entityDetails}
                                                    .emptyMessage=${this.localize('NoDatAvaMsg')}
                                                    .isRowSelectable=${false}
                                                    .showEmptyMessageWithHeaders
                                                >
                                                </pebble-grid>`
                                              : ``}
                                      </div>
                                  </pebble-accordion>

                                  <pebble-accordion
                                      id="reviewGridAccordion"
                                      .isCollapsed=${false}
                                      .headerText=${this._reviewAccordionHeaderName}
                                  >
                                      <div slot="accordion-content" class="grid-container">
                                          ${!ObjectUtils.isEmpty(this._dnbReviewGridItems)
                                              ? html`<pebble-grid
                                                    id="dnbResultReviewGrid"
                                                    .columns=${this._dnbReviewGridColumns}
                                                    .gridData=${this._dnbReviewGridItems}
                                                    @row-selection-changed="${e => {
                                                        this._rowSelectionChanged(e);
                                                    }}"
                                                    .emptyMessage=${this.localize('NoDatAvaMsg')}
                                                    .showEmptyMessageWithHeaders
                                                >
                                                </pebble-grid>`
                                              : ``}
                                      </div>
                                  </pebble-accordion>
                              </pebble-accordion-group-lit>

                              <pebble-dialog
                                  id="nestedDialog"
                                  modal
                                  no-cancel-on-outside-click
                                  no-cancel-on-esc-key
                                  show-close-icon
                              >
                                  <div class="nested-content">
                                      <pebble-grid
                                          id="nestedGrid"
                                          .columns=${this._nestedGridColumns}
                                          .gridData=${this._nestedGridItems}
                                          .emptyMessage=${this.localize('NoDatAvaMsg')}
                                          .isRowSelectable=${false}
                                          .showEmptyMessageWithHeaders
                                      >
                                      </pebble-grid>
                                  </div>
                              </pebble-dialog>
                          `
                        : ``}
                    <pebble-popover
                        id="popover-summary-list"
                        class="popover-summary-list"
                        for="summary-list"
                        no-overlap=""
                        display-arrow-as-per-target=""
                        horizontal-align="right"
                    >
                        <div class="summary-popup-title">${this.localize('SumTit')}</div>
                        <div id="content-status" class="${this._getClassByBulkProcess(this._isBulkProcess)}">
                            <div class="content-status-message">
                                <div class="content-status-message--row">
                                    <!--div class="status-info">
                                        <span class="ignore-count"
                                            >${this._getStatusCount(this._reviewEntities, 'Ignored')}</span
                                        >
                                        ${this.localize('IgnStaTxt')}
                                    </div-->
                                    <div class="status-info">
                                        <span class="merge-count"
                                            >${this._getStatusCount(this._reviewEntities, 'Identified')}</span
                                        >
                                        ${this.localize('IdeStaTxt')}
                                    </div>
                                    <div class="status-info">
                                        <span class="skipped-count"
                                            >${this._getStatusCount(this._reviewEntities, 'Skipped')}</span
                                        >
                                        ${this.localize('SkidTxt')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </pebble-popover>
                </div>
                ${DNBHelper.getConfirmationDialogTemplate(this.dialogOptions)}
            </div>
        `;
    }

    constructor() {
        super();

        this.contextData = {};
        this.entityGridConfig = {};
        this.dnbReviewGridConfig = {};
        this.dialogOptions = {
            dialogTitle: this.localize('ConWitDNBIdeTxt'),
            buttonOkText: this.localize('ConTxt'),
            dialogMsgCode: this.localize('ConWitDNBConfTxt')
        };

        this._loading = true;
        this._message = '';
        this._selectedDNBResult = {};
        this._currentIndex = 0;
        this._reviewStatus = '';
        this._reviewEntities = [];
        this._isBulkProcess = false;
        this._isConfigLoaded = false;
        this._isDNBProcessValid = true;
        this._currentEntityName = '';
        this._actionCompletedMessage = '';
        this._actionStatus = '';
        this._entityDNBStatusAttribute = AppConstants.DNB_IDENTIFICATION_STATE;
        this._entityGRMStateAttribute = AppConstants.GRM_STATE;
        this._dnbReviewResultsContextId = QueryParamsUtils.getParamValue('pluginContextId');
        this._dnbGenericObjectResponse = [];
        this._ignoreAll = false;

        //Accordion Properties
        this._activeAccordions = [0, 1];
        this._reviewAccordionHeaderName = '';
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    firstUpdated() {
        super.firstUpdated();
    }

    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            this._onPropertyChange(propName);
        });
    }

    _onPropertyChange(propertyName) {
        switch (propertyName) {
            case '_dnbReviewResultsContextId':
                this._onDNBReviewResultsContextIdChange();
                break;
            default:
                break;
        }
    }

    _onDNBReviewResultsContextIdChange() {
        if (!this._dnbReviewResultsContextId) {
            return;
        }
        let dnbReviewContext = JSON.parse(sessionStorage.getItem(this._dnbReviewResultsContextId));
        if (dnbReviewContext) {
            this.contextData = dnbReviewContext['context-data'];
            this._isBulkProcess = !dnbReviewContext['is-single-entity-process'];
            let selectedItems = [];
            if (this._isBulkProcess) {
                selectedItems = dnbReviewContext['selected-entities'];
            } else {
                let itemContext = ContextUtils.getFirstItemContext(this.contextData);
                if (itemContext) {
                    selectedItems = [
                        {
                            id: itemContext.id,
                            type: itemContext.type
                        }
                    ];
                }
            }
            this._selectedEntities = selectedItems;
            this._triggerConfigGet();
        } else {
            LoggerManager.logError(this, 'DNBReview', 'DNBReview context session not available');
        }
    }

    _triggerConfigGet() {
        if (ObjectUtils.isEmpty(this.contextData)) {
            return;
        }
        this._loading = true;
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        //App specific
        let appContext = ContextUtils.getFirstAppContext(clonedContextData);
        if (appContext) {
            this.appName = appContext.app;
        }
        this.requestConfig('plugin-dnb-review-results', clonedContextData);
    }

    async onConfigLoaded(componentConfig) {
        if (ObjectUtils.isEmpty(this.dnbReviewGridConfig) || ObjectUtils.isEmpty(this.entityGridConfig)) {
            this._message = this.localize('CfgMissgMsg');
            this._isDNBProcessValid = false;
            this._isBulkProcess = false;
            this._loading = false;
            return;
        }
        this._sortDNBReviewGridColumns();
        this._isConfigLoaded = true;
        this._reviewEntity();
    }

    async _reviewEntity() {
        if (!this._dnbReviewResultsContextId || !this._isConfigLoaded) {
            return;
        }
        if (this._currentIndex < this._selectedEntities.length) {
            this._resetReview();
            this._reviewStatus = `${this._currentIndex + 1} / ${this._selectedEntities.length}`;
            this._loading = true;
            await this._triggerReviewProcess();
            this._loading = false;
        } else {
            this._triggerSubTitleChange();
            this._tiggerFinishStep();
        }
    }

    async _triggerReviewProcess() {
        await this._prepareCurrentEntityDetails();
        if (!this._isDNBProcessValid) {
            this._message = this.localize('EntNotValForDNBRevMsg', { entityName: this._currentEntityName });
            this._loading = false;
            return;
        }
        await this._prepareDNBResultsForEntity();
    }

    /**
     * Fetch entity model & entity data, show in the grid
     */
    async _prepareCurrentEntityDetails() {
        let currentEntity = ObjectUtils.cloneObject(this._selectedEntities[this._currentIndex]);
        if (currentEntity) {
            let clonedContextData = ObjectUtils.cloneObject(this.contextData);
            currentEntity.attributeNames = ['_ALL'];
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [currentEntity];
            let entityCompositeModel = await this._getCompositeModel(clonedContextData);
            let attributeModels = DataTransformHelper.transformAttributeModels(
                entityCompositeModel,
                this.contextData,
                undefined,
                true,
                true
            );

            let externalAttribute = Object.keys(attributeModels).find(
                attrModelKey => attributeModels[attrModelKey].isExternalName
            );

            let attributes = [];
            Object.keys(this.entityGridConfig.attributes).forEach(attributeKey => {
                attributes.push(this.entityGridConfig.attributes[attributeKey].name);
            });

            if (externalAttribute && !attributes.find(attribute => attribute == externalAttribute)) {
                attributes.push(externalAttribute);
            }

            //Add additional attributes which are needed for the process
            if (
                this._entityDNBStatusAttribute &&
                !attributes.find(attribute => attribute == this._entityDNBStatusAttribute)
            ) {
                attributes.push(this._entityDNBStatusAttribute);
            }

            if (!ObjectUtils.isEmpty(attributes)) {
                currentEntity.attributeNames = attributes;
                clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [currentEntity];
                let req = DataRequestHelper.createEntityGetRequest(clonedContextData, true);
                let entityGetReq = DataObjectManager.createRequest('getbyids', req, undefined, {
                    objectsCollectionName: 'entities'
                });
                let entityGetResponse = await DataObjectManager.initiateRequest(entityGetReq);

                if (ObjectUtils.isValidObjectPath(entityGetResponse, 'response.content.entities.0')) {
                    let entity = entityGetResponse.response.content.entities[0];
                    let entityGridColumns = [];
                    let configuredModels = {};

                    let entityDNBStatus = '';
                    if (ObjectUtils.isValidObjectPath(entity, `data.attributes.${this._entityDNBStatusAttribute}`)) {
                        entityDNBStatus = AttributeUtils.getFirstAttributeValue(
                            entity.data.attributes[this._entityDNBStatusAttribute]
                        );
                    }

                    let configuredAttributes = Object.keys(this.entityGridConfig.attributes).map(
                        key => this.entityGridConfig.attributes[key].name
                    );

                    //Include external attribute, if it is not available in config
                    if (!configuredAttributes.includes(externalAttribute)) {
                        configuredAttributes.push(externalAttribute);
                    }

                    configuredAttributes.forEach(attributeKey => {
                        if (attributeModels[attributeKey]) {
                            if (
                                attributeModels[attributeKey].properties &&
                                !attributeModels[attributeKey].properties.displaySequence
                            ) {
                                attributeModels[attributeKey].properties.displaySequence = 9999999;
                            }
                            configuredModels[attributeKey] = attributeModels[attributeKey];
                        }
                    });

                    configuredModels = ObjectUtils.sortObjects(configuredModels, ['properties.displaySequence']);

                    Object.keys(configuredModels).forEach(modelKey => {
                        entityGridColumns.push(this._getGridColumn(attributeModels[modelKey]));
                    });

                    let transformedAttributes = DataTransformHelper.transformAttributes(
                        entity,
                        configuredModels,
                        clonedContextData
                    );
                    let entityGridItem = {};
                    let externalAttributeValue = '';
                    for (let attributeKey in transformedAttributes) {
                        entityGridItem[attributeKey] = transformedAttributes[attributeKey].value;
                        if (externalAttribute == attributeKey) {
                            externalAttributeValue = transformedAttributes[attributeKey].value;
                        }
                    }

                    this._currentEntityName = externalAttributeValue || currentEntity.id;
                    this._reviewEntities.push({
                        Name: this._currentEntityName,
                        'Action Performed': 'Pending'
                    });
                    this._triggerSubTitleChange(this._currentEntityName);

                    if (entityDNBStatus !== AppConstants.DNB_IDENTIFICATION_STATE_IN_REVIEW) {
                        this._isDNBProcessValid = false;
                        this._message = this.localize('EntNotValForDNBRevMsg', { entityName: this._currentEntityName });
                        return;
                    }

                    this._entityGridColumns = entityGridColumns;
                    this._entityDetails = [entityGridItem];
                }
            }
        }
    }

    async _prepareDNBResultsForEntity() {
        let dnbGridColumns = [];
        if (this.dnbReviewGridConfig && !ObjectUtils.isEmpty(this.dnbReviewGridConfig.attributes)) {
            let attributes = this.dnbReviewGridConfig.attributes;
            Object.keys(attributes).forEach(attributeKey => {
                let model = attributes[attributeKey];
                dnbGridColumns.push(this._getGridColumn(model, true, true, true));
            });
        }
        this._dnbReviewGridColumns = dnbGridColumns;
        let dnbResults = await this._getDNBReviewResults();

        const mergeBtn = this.shadowRoot.querySelector('#merge');
        if (ObjectUtils.isEmpty(dnbResults)) {
            this._continueButtonClass = 'btn-success';
            this._reviewAccordionHeaderName = this.localize('DNBIdnResRecFouTxt', { count: 0 });
            this._dnbReviewGridItems = [];
            mergeBtn.setAttribute('hidden', '');
            return;
        }
        mergeBtn.removeAttribute('hidden');
        this._continueButtonClass = 'btn-secondary';

        //Format dnb results along with nested as per config
        dnbResults.forEach((dnbData, index) => {
            dnbData.data['dnbId'] = index;
        });
        this._dnbGenericObjectResponse = dnbResults;
        this._reviewAccordionHeaderName = this.localize('DNBIdnResRecFouTxt', { count: dnbResults.length });
        this._dnbReviewGridItems = this._formatDNBResults(dnbResults);
    }

    _prepareAttribute(value, referenceDataId) {
        const attributeJSON = AttributeUtils.getEmptyValue(DALCommonUtils.getDefaultValContext());
        attributeJSON.value = value;

        if(referenceDataId) {
            attributeJSON.properties = {
                referenceData: referenceDataId
            }
        }
        return {
            values: [attributeJSON]
        };
    }

    async _deleteGenericObject() {
        let currentEntity = this._selectedEntities[this._currentIndex];
        let deleteRequest = {
            genericObject: {
                id: `dnbreview_${currentEntity.id}`,
                type: 'dnbreview'
            }
        };

        let url = '/data/pass-through/genericobjectmanageservice/delete';
        let genericObjectDelResponse = await DataObjectManager.rest(url, deleteRequest);
        if (
            !genericObjectDelResponse ||
            !genericObjectDelResponse.response ||
            genericObjectDelResponse.response.status != 'success'
        ) {
            LoggerManager.logError(this, 'Unable to delete generic object', genericObjectDelResponse);
        }
        this._loading = false;
        ToastManager.showSuccessToast(this._actionCompletedMessage);
        this._triggerNextStep(this._actionStatus);
    }

    async _saveEntity(operation, attributesObj, isMerge = false) {
        //Prepare entity request
        let request = this._selectedEntities[this._currentIndex];
        request = {
            entities: [
                {
                    id: request.id,
                    type: request.type,
                    data: {
                        attributes: attributesObj
                    }
                }
            ]
        };

        //Prepare notification object
        let notificationInfoObj = NotificationHelper.prepareClientStateInfo(request);
        if (ObjectUtils.isValidObjectPath(notificationInfoObj, 'notificationInfo.context')) {
            notificationInfoObj.notificationInfo.context.isMatchMerge = true;
        }
        let options = {
            objectsCollectionName: 'entities',
            validateRequest: false,
            clientStateInfo: notificationInfoObj,
            dataIndex: 'entityData'
        };

        //Entity save
        let entitySaveReq = DataObjectManager.createRequest(operation, request, undefined, options);
        let entitySaveResponse = await DataObjectManager.initiateRequest(entitySaveReq);
        if (!entitySaveResponse || !entitySaveResponse.response || entitySaveResponse.response.status != 'success') {
            this._loading = false;
            ToastManager.showErrorToast(this.localize('ProFaiMsg'));
            LoggerManager.logError(this, 'Failed to update entity', entitySaveResponse);
            return;
        }
        this._actionCompletedMessage = isMerge ? this.localize('DNBResMerSucMsg') : this.localize('DNBBypSucMsg');
        this._actionStatus = AppConstants.DNB_IDENTIFICATION_STATE_IDENTIFIED;
        this._deleteGenericObject();
    }

    /*_onIgnoreTap() {
        this._loading = true;
        let attributesObj = {};
        attributesObj[this._entityDNBStatusAttribute] = this._prepareAttribute('Not Found');
        this._saveEntity('update', attributesObj);
    }*/

    _onContinueWithoutDunsTap() {
        this._openConfirmationDialog();
    }

    _openConfirmationDialog() {
        const windowConfirmDialog = this.shadowRoot.querySelector('#windowConfirmDialog');
        windowConfirmDialog.openAsConfirmDialog(this);
    }

    async confirmDialogHandler(confirmStatus) {
        if (confirmStatus) {
            this._loading = true;
            await this._onContinueWithoutDunsConfirm();
        }
    }

    /**
     * When user proceeds to continue without DUNS number, update the DNBIdentification state as Identified in the entity.
     */
    async _onContinueWithoutDunsConfirm() {
        const dnbIdentificationStateRefId = await this._getDnbIdentificationStateRefId(AppConstants.DNB_IDENTIFICATION_STATE_IDENTIFIED);
        const dnbStatusAttrObj = this._prepareAttribute(AppConstants.DNB_IDENTIFICATION_STATE_IDENTIFIED, dnbIdentificationStateRefId);
        const attributesObj = { [this._entityDNBStatusAttribute]: dnbStatusAttrObj };
        try {
            await this._saveEntity('update', attributesObj, false);
        } catch (error) {
            LoggerManager.logError(this, 'Entity update failed', error);
        }
        this._loading = false;
    }

    async _getDnbIdentificationStateRefId(state) {
        if(!state) {
            return "";
        }
        const types = [AppConstants.DNB_IDENTIFICATION_STATE, AppConstants.GRM_STATE];
        const attributeModelGetRequest = DataRequestHelper.createGetAttributeModelRequest(types);
        attributeModelGetRequest.params.fields.properties = ["isReferenceType", "refEntityInfo"];
        const options = {
            dataIndex: "entityModel"
        }
        const dalRequest = DataObjectManager.createRequest("searchandget", attributeModelGetRequest, options);
        const refId = DNBHelper.getReferenceId(entityType, entityName);
    }

    async _getGrmStateRefId(state){

    }

    _onMergeTap() {
        if (ObjectUtils.isEmpty(this._selectedDNBResult)) {
            return;
        }
        this._loading = true;
        let attributesObj = {};
        let matchObject = this._dnbGenericObjectResponse.find(
            dnbData => dnbData.data && dnbData.data.dnbId === this._selectedDNBResult.dnbId
        );
        attributesObj = matchObject.data.attributes;

        const dnbIdentificationStateRefId = this._getDnbIdentificationStateRefId(AppConstants.DNB_IDENTIFICATION_STATE_IDENTIFIED);
        const grmStateRefId = this._getGrmStateRefId(AppConstants.GRM_STATE_UPDATE);
        attributesObj[this._entityDNBStatusAttribute] = this._prepareAttribute(
            AppConstants.DNB_IDENTIFICATION_STATE_IDENTIFIED, dnbIdentificationStateRefId
        );
        attributesObj[this._entityGRMStateAttribute] = this._prepareAttribute(AppConstants.GRM_STATE_UPDATE, grmStateRefId);
        this._saveEntity('update', attributesObj, true);
    }

    async _getDNBReviewResults() {
        let currentEntity = ObjectUtils.cloneObject(this._selectedEntities[this._currentIndex]);
        if (!currentEntity) {
            return;
        }
        let firstValueContext = ContextUtils.getFirstValueContext(this.contextData);
        let dnbGetRequest = {
            params: {
                query: {
                    id: `dnbreview_${currentEntity.id}`,
                    valueContexts: [firstValueContext],
                    filters: {
                        typesCriterion: ['dnbreview']
                    }
                },
                fields: {
                    jsonData: true
                }
            }
        };

        const options = {
            dataIndex: 'genericObjectData'
            //TODO: Is it a valid scenario for the user to manually revert the state to inreview after choosing a review record and merging it?
            // noCache: true
        };

        const dalRequest = DataObjectManager.createRequest('searchandget', dnbGetRequest, undefined, options);
        let dalResponse;
        try {
            dalResponse = await DataObjectManager.initiateRequest(dalRequest);
        } catch (error) {
            LoggerManager.logError(this, 'Unable to fetch dnb review results', error);
        }

        let dnbResults = [];
        if (
            ObjectUtils.isValidObjectPath(dalResponse, 'response.content.genericObjects.0.data.jsonData.dnbresponses')
        ) {
            dnbResults = dalResponse.response.content.genericObjects[0].data.jsonData.dnbresponses;
        }
        return dnbResults;
    }

    _formatDNBResults(dnbResults) {
        let formattedDNBResults = [];
        let configuredAttributs = this.dnbReviewGridConfig.attributes || {};
        dnbResults.forEach(resultObj => {
            if (!resultObj.data || !resultObj.data.attributes) {
                return;
            }
            let resAttributes = resultObj.data.attributes;
            let formattedResultObj = this._formatDNBResult(resAttributes, configuredAttributs);
            formattedResultObj['dnbId'] = resultObj.data.dnbId;
            formattedDNBResults.push(formattedResultObj);
        });
        return formattedDNBResults;
    }

    _formatDNBResult(resAttributes, configuredAttributs) {
        let formattedDNBResultObj = {};
        for (let attributeName in configuredAttributs) {
            let configuredAttribute = configuredAttributs[attributeName];
            let resAttribute = resAttributes[attributeName];
            let attributeValue = AttributeUtils.getAtributeValueForGrid(resAttribute, configuredAttribute);
            formattedDNBResultObj[attributeName] = attributeValue;
            if (configuredAttribute.dataType == 'nested' && !ObjectUtils.isEmpty(attributeValue)) {
                let nestedResults = [];
                attributeValue.forEach(nestedItem => {
                    nestedResults.push(this._formatDNBResult(nestedItem, configuredAttributs[attributeName].group));
                });
                formattedDNBResultObj[attributeName] = nestedResults;
            }
        }
        return formattedDNBResultObj;
    }

    _triggerSubTitleChange(title = ' ') {
        PubSubManager.fireBedrockEvent(
            'app-titlebar-update',
            {
                actionSubTitle: title
            },
            { ignoreId: true }
        );
    }

    _getGridColumn(model, isFilterable = false, isSortable = false, isResizable = true) {
        let column = {
            headerName: model.externalName,
            field: model.name,
            name: model.name,
            headerTooltip: model.externalName,
            tooltipField: model.name,
            filterable: isFilterable,
            sortable: isSortable,
            resizable: isResizable,
            displaySequence: 1,
            minWidth: 120,
            flex: 1
        };

        if (model.dataType == 'nested') {
            column.cellRenderer = 'pebbleGridLinkCell';
            column.cellRendererParams = params => {
                return {
                    params: params,
                    isNestedGrid: true,
                    onLinkCellClick: data => {
                        return this._onLinkCellClick(data);
                    }
                };
            };
        }

        return column;
    }

    _onNextTap() {
        //Reset the selection
        this._selectedDNBResult = {};
        this._triggerNextStep();
    }

    _triggerNextStep(status = 'Skipped') {
        if (this._reviewEntities[this._currentIndex]) {
            this._reviewEntities[this._currentIndex]['Action Performed'] = status;
        }
        this._currentIndex++;
        this._reviewEntity();
    }

    _tiggerFinishStep() {
        let resultObj = { messages: this._reviewEntities, isGrid: true };
        this.dataFunctionComplete(resultObj, [], false, true);
    }

    _onLinkCellClick(data) {
        let column = data.column;
        let nestedGridItems = data.item[column.name];

        let nestedGridColumns = [];
        if (ObjectUtils.isValidObjectPath(this.dnbReviewGridConfig, `attributes.${column.name}.group`)) {
            let group = this.dnbReviewGridConfig.attributes[column.name].group;
            Object.keys(group).forEach(attributeKey => {
                let model = group[attributeKey];
                nestedGridColumns.push(this._getGridColumn(model, true, true, true));
            });
        }

        let nestedDialog = this.shadowRoot.querySelector('#nestedDialog');
        if (nestedDialog) {
            nestedDialog.dialogTitle = `${column.headerName}`;
            this._nestedGridColumns = nestedGridColumns;
            this._nestedGridItems = nestedGridItems;
            nestedDialog.open();
        }
    }

    showSummaryList(event) {
        let popoverSummaryList = this.shadowRoot.querySelector('#popover-summary-list');
        if (popoverSummaryList) {
            popoverSummaryList.positionTarget = event.target;
            popoverSummaryList.show(true);
        }
    }

    async _getCompositeModel(contextData) {
        let compositeModel = {};
        let request = DataRequestHelper.createEntityModelCompositeGetRequest(contextData);
        if (request) {
            compositeModel = await EntityCompositeModelManager.getCompositeModel(request, contextData, true);
        }
        if (!compositeModel || !compositeModel.data) {
            this._handleCompositeModelGetError(compositeModel);
        } else {
            return compositeModel;
        }
    }

    _handleCompositeModelGetError(compositeModel) {
        this._loading = false;
        LoggerManager.logError(this, 'Composite model get exception', compositeModel);
    }

    _getClassByBulkProcess() {
        if (this._isBulkProcess) {
            return 'widget-box';
        }
        return '';
    }

    _getStatusCount(reviewEntities, type) {
        let filteredEntities = reviewEntities.filter(entity => entity['Action Performed'] == type);
        return filteredEntities.length;
    }

    _rowSelectionChanged(e) {
        let selectedItem = {};
        if (e && e.detail) {
            let detail = e.detail;
            if (!ObjectUtils.isEmpty(detail.selectedItems)) {
                selectedItem = detail.selectedItems[0];
            }
        }
        this._selectedDNBResult = selectedItem;
    }

    _resetReview() {
        this._message = '';
        this._isDNBProcessValid = true;
        this._currentEntityName = '';
        this._actionCompletedMessage = '';
        this._actionStatus = '';
        this._triggerSubTitleChange();
    }

    _sortDNBReviewGridColumns() {
        if (!this.dnbReviewGridConfig.attributes) {
            return;
        }
        let attributes = this.dnbReviewGridConfig.attributes;
        Object.keys(attributes).forEach(attrKey => {
            if (!attributes[attrKey].displaySequence) {
                attributes[attrKey].displaySequence = 9999999;
            }
            if (attributes[attrKey].dataType == 'nested' && attributes[attrKey].group) {
                Object.keys(attributes[attrKey].group).forEach(nestedAttrKey => {
                    if (!attributes[attrKey].group[nestedAttrKey].displaySequence) {
                        attributes[attrKey].group[nestedAttrKey].displaySequence = 9999999;
                    }
                });
                attributes[attrKey].group = ObjectUtils.sortObjects(attributes[attrKey].group, ['displaySequence']);
            }
        });
        this.dnbReviewGridConfig.attributes = ObjectUtils.sortObjects(attributes, ['displaySequence']);
    }
}
customElements.define('plugin-dnb-review-results', PluginDNBResultReview);
