//lit
import { LitElement, html } from 'lit';
import { MixinManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/mixin-manager.js';
import { RufElement } from '@riversandtechnologies/ui-platform-elements/lib/base/ruf-element.js';
import { AppBase } from '@riversandtechnologies/ui-platform-elements/lib/base/app-base.js';
import ComponentConfigBase from '@riversandtechnologies/ui-platform-business-elements/lib/base/component-config-base.js';
// ui-platform-utils
import { ObjectUtils } from '@riversandtechnologies/ui-platform-utils/lib/common/ObjectUtils.js';
import { Constants } from '@riversandtechnologies/ui-platform-utils/lib/mdm/Constants.js';
import { ContextUtils } from '@riversandtechnologies/ui-platform-utils/lib/mdm/ContextUtils.js';
import { EntityUtils } from '@riversandtechnologies/ui-platform-utils/lib/mdm/EntityUtils.js';
import { AttributeUtils } from '@riversandtechnologies/ui-platform-utils/lib/mdm/AttributeUtils.js';
import { UniqueIdUtils } from '@riversandtechnologies/ui-platform-utils/lib/common/UniqueIdUtils.js';
// ui-platform-elements
import '@riversandtechnologies/ui-platform-elements/lib/elements/bedrock-lov/bedrock-lov.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/bedrock-grid/bedrock-grid.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-button/pebble-button.js';
import { BedrockGridDataSource } from '@riversandtechnologies/ui-platform-elements/lib/base/BedrockGridDataSource.js';
import { DialogManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/dialog-manager.js';

// ui-platform-dataaccess
import { DataObjectManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/DataObjectManager.js';
import { EntityTypeManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/EntityTypeManager.js';
import { DALCommonUtils } from '@riversandtechnologies/ui-platform-dataaccess/lib/utils/DALCommonUtils.js';
import { EntityCompositeModelManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/EntityCompositeModelManager.js';
// ui-platform-business-elements
import '@riversandtechnologies/ui-platform-business-elements/lib/elements/rock-attribute/rock-attribute.js';
import '@riversandtechnologies/ui-platform-business-elements/lib/elements/rock-entity-type-model-lov/rock-entity-type-model-lov.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-spinner/pebble-spinner.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/bedrock-pubsub/bedrock-pubsub.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-dropdown/pebble-dropdown.js';

import DataRequestHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/DataRequestHelper.js';
import DataTransformHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/DataTransformHelper.js';
import { EntityGridDataSource } from '@riversandtechnologies/ui-platform-business-elements/lib/managers/EntityGridDataSource.js';
// Include Styles
import { styles as sharedStyles } from '@riversandtechnologies/ui-platform-elements/lib/flow/core/base/shared.element.css.js';
import { styles as localStyle } from './rock-drag-drop-grid.element.css.js';
import { LoggerManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/logger-manager.js';
import RelMappingHelper from '../../helpers/RelMappingHelper.js';
import { ToastManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/toast-manager.js';

import DataHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/DataHelper.js';
import '@riversandtechnologies/ui-platform-business-elements/lib/elements/rock-entity-lov/rock-entity-lov.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-popover/pebble-popover.js';
import { ContextModelManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/ContextModelManager.js';
import { DataObjectSortUtils } from '@riversandtechnologies/ui-platform-utils/lib/mdm/DataObjectSortUtils.js';
import '@riversandtechnologies/ui-platform-elements/lib/elements/pebble-icon/pebble-icon.js';

class RockDragDropGrid extends MixinManager(LitElement).with(ComponentConfigBase, RufElement, AppBase) {
    render() {
        return html` <div class="grid-wrapper relative" flow-layout="p:sm m-t:sm">
            <pebble-spinner .active=${this._loading}></pebble-spinner>
            <div class="base-grid-structure">
                <div class="base-grid-structure-child-1">
                    <div flow-layout="gap:md" class="relative filter-container">
                        ${this.showDomainFilter && !ObjectUtils.isEmpty(this._isDomainLovPrepared)
                            ? html`<div>
                                  <bedrock-lov
                                      id="${this.configType}_domainDropdown"
                                      .showActionButtons="${false}"
                                      .selectAll=${false}
                                      .multiSelect=${false}
                                      .filterEnabled="${true}"
                                      .items="${this._domainList}"
                                      .noLabelFloat="${true}"
                                      .noSubTitle="${true}"
                                      .label="${this.localize('DomTxt')}"
                                      .selectedItem=${this._selectedDomain}
                                      @selected-value-changed="${this._onDomainChange}"
                                      @tag-removed="${this._onDomainChange}"
                                  ></bedrock-lov>
                              </div>`
                            : html``}
                        ${this.showSourceFilter && this._isSourceLovPrepared
                            ? html`<div>
                                  <bedrock-lov
                                      id="${this.configType}_sourceDropdown"
                                      .showActionButtons="${false}"
                                      .selectAll=${false}
                                      .multiSelect=${false}
                                      .filterEnabled="${true}"
                                      .items="${this._sourceList}"
                                      .noLabelFloat="${true}"
                                      .noSubTitle="${true}"
                                      .label="${this.configType == 'source'
                                          ? this.localize('SrcTxt')
                                          : this.localize('TarTxt')}"
                                      .selectedItem=${this._selectedSource}
                                      @selected-value-changed="${this._onSourceChange}"
                                      @tag-removed="${this._onSourceChange}"
                                  ></bedrock-lov>
                              </div>`
                            : html``}
                        ${this.showRelationshipFilter && this._isRelationshipLovPrepared && this.configType === 'target'
                            ? html`<div>
                                  <bedrock-lov
                                      id="${this.configType}_relationshipDropdown"
                                      .showActionButtons="${false}"
                                      .selectAll=${false}
                                      .multiSelect=${false}
                                      .filterEnabled="${true}"
                                      .items="${this._relationshipTypes}"
                                      .noLabelFloat="${true}"
                                      .noSubTitle="${true}"
                                      .label="${this.localize('RelTxt')}"
                                      .selectedItem=${this._selectedRelationship}
                                      @selected-value-changed="${this._onRelationshipTypeChange}"
                                      @tag-removed="${this._onRelationshipTypeChange}"
                                  ></bedrock-lov>
                              </div>`
                            : html``}
                        ${this.config?.showAttributeFilter && this._isFilterAttributeModelPrepared
                            ? html`
                            <div>
                                <rock-attribute
                                    id="attributeFilter"
                                    class="attributeFilter"
                                    title=${this.attributeModelObject.externalName}
                                    .name=${this.attributeModelObject.externalName}
                                    .contextData=${this.contextData}
                                    .attributeModelObject=${this.attributeModelObject}
                                    .attributeObject=${this.attributeObject}
                                    .originalAttributeObject=${this.originalAttributeObject}
                                    .hideHistory=${true}
                                    .hideEdit=${true}
                                    .hideSourceInfo=${true}
                                    .label="${this.attributeModelObject?.externalName}"
                                    .value=${this.attributeObject.value}
                                    .mode=${this.mode}
                                    @attribute-value-changed=${this._onAttributeValueChanged}
                                    @keydown=${this._keyDown}
                                    .displayLimit=${this.displayLimit}
                                >
                                </rock-attribute>
                            </div`
                            : html``}
                        ${this.config?.showContextSelector
                            ? html`
                                  <pebble-icon
                                      class="flow-icon-size-16 globe-icon-position ${this.getContextIconColorClass()}"
                                      noink=""
                                      id="${this.configType}_contextIcon"
                                      target-id="${this.configType}_contextPopover"
                                      name="context"
                                      icon="pebble-icon:globe"
                                      @tap=${this.openContextPopover}
                                      title=${this._contextPebbleIconTitle}
                                  >
                                  </pebble-icon>

                                  ${this._isReadyToShowContextPopover
                                      ? html` <pebble-popover
                                            class="absolute"
                                            id="${this.configType}_contextPopover"
                                            for="${this.configType}_contextIcon"
                                            verticalAlign="auto"
                                            horizontalAlign="auto"
                                            .noOverlap=${true}
                                            .enableResize=${false}
                                        >
                                            <rock-entity-lov
                                                id="${this.configType}_contextLov"
                                                .rData=${this._ctxData}
                                                .lazyLoadingDisabled=${true}
                                                .idField=${this._ctxData.dataMappings.id}
                                                .subTitlePattern=${this._ctxData.dataMappings.subtitle}
                                                .requestData=${this._ctxData.dataRequest}
                                                .typeField=${this._ctxData.dataMappings.type}
                                                .externalDataFormatter=${this._contextDataFormatter}
                                                .showActionButtons=${true}
                                                .getTitleFromModel=${true}
                                                .multiSelect=${this._ctxData.multiSelect}
                                                .noSubTitle=${false}
                                            ></rock-entity-lov>
                                        </pebble-popover>`
                                      : ''}
                              `
                            : html``}
                        <bedrock-pubsub
                            event-name="entity-lov-confirm-button-tap"
                            .handler=${this._onContextLovConfirmButtonTapped}
                            target-id="${this.configType}_contextLov"
                        ></bedrock-pubsub>
                        <bedrock-pubsub
                            event-name="entity-lov-close-button-tap"
                            .handler=${this.closeContextPopover}
                            target-id="${this.configType}_contextLov"
                        ></bedrock-pubsub>
                    </div>

                    <div flow-layout="grid cols:auto gap:md">
                        <div flow-layout="vertical m-t:sm" class="search_wrapper">
                            <pebble-search-bar
                                id="${this.configType}_searchBar"
                                placeholder="${this.localize('SeaTxt')}"
                                .isGlobal=${true}
                            ></pebble-search-bar>
                            <pebble-button
                                class="resetSearch"
                                icon="pebble-icon:reset"
                                medium-text
                                @tap="${this._onResetSearchClicked}"
                                .buttonText="${this.localize('RSTxt')}"
                            ></pebble-button>
                        </div>
                        ${this.showMappedFilter
                            ? html` <div flow-layout="m-t:xs">
                                  <pebble-dropdown
                                      id="${this.configType}_mappedFilterDropdown"
                                      label=""
                                      .selectedValue=${this._selectedMappedFilter?.title}
                                      .items=${this._mappedFilterItems}
                                      @change=${this._onMappedFilterChange}
                                      no-label-float
                                  ></pebble-dropdown>
                              </div>`
                            : ``}
                    </div>
                </div>
                <div class="base-grid-structure-child-2 relative">
                    <pebble-spinner .active=${this._loading}></pebble-spinner>
                    ${!ObjectUtils.isEmpty(this.config)
                        ? html` <bedrock-grid
                              id="${this.configType}_dragDropGrid"
                              .config="${this._gridConfig}"
                              .columns=${this._columns}
                              .actionScope=${this._actionScope}
                              .options=${this._gridOptions}
                              .showEmptyMessageWithHeaders=${this._isGridDataEmpty}
                              .emptyMessage=${this._gridInfo}
                              .editEnabled=${false}
                              .showCompactTitles=${true}
                              ?hideViewSelector=${true}
                              .resultRecordSize=${this.resultRecordSize}
                              .currentRecordSize=${this.currentRecordSize}
                              .showSelectAllCheckbox=${false}
                              .scopeId=${this.scopeId}
                          ></bedrock-grid>`
                        : ``}
                </div>
            </div>
        </div>`;
    }

    static get styles() {
        return [sharedStyles, localStyle];
    }

    static get properties() {
        return {
            config: { type: Object },
            configType: { type: String }, //source or target
            contextData: { type: Object, attribute: false },
            _loading: { type: Boolean },
            mappedRelName: { type: String },
            _userSelectedSource: { type: Object },
            _userSelectedSourceDomain: { type: Object },

            //Grid properties
            _columns: { type: Array, attribute: false },
            rowSelection: { type: String },
            options: { type: Object, attribute: false },
            _gridOptions: { type: Object, attribute: false },
            _gridConfig: { type: Object },
            _isGridDataEmpty: { type: Boolean },
            _gridInfo: { type: String },
            pageSize: { type: Number },
            batchSize: { type: Number },
            _dataIndex: { type: String },
            _actionScope: { type: Object },
            maxConfiguredCount: { type: Number },
            resultRecordSize: { type: Number },
            currentRecordSize: { type: Number },
            scopeId: { type: String },
            _dataSource: { type: Object },
            expandTreeByDefaultUptoLevel: { type: Number },
            rowBackgroundColor: { type: Object },
            invalidateCache: { type: Boolean },
            _hierarchicalColId: { type: String },
            _hierarchicalColName: { type: String },
            _hierarchicalColWidth: { type: Number },

            actions: { type: Object },
            globalActions: { type: Object },

            //Domain properties
            _isDomainLovPrepared: { type: Boolean },
            _domainList: { type: Array },
            _selectedDomain: { type: Object },
            showDomainFilter: { type: Boolean },

            //Source or target properties
            _isSourceLovPrepared: { type: Boolean },
            _sourceList: { type: Array },
            _selectedSource: { type: Object },
            showSourceFilter: { type: Boolean },
            allowMappingOnlyAtLeafNode: { type: Boolean },
            showOnlyLeafNodes: { type: Boolean },

            //Relationship properties
            _relationshipTypes: { type: Array },
            _selectedRelationship: { type: Object },
            attributeModels: { type: Object },
            _isRelationshipLovPrepared: { type: Boolean },
            showRelationshipFilter: { type: Boolean },

            //Mapped Filter properties
            _mappedFilterItems: { type: Array },
            _selectedMappedFilter: { type: Object },
            showMappedFilter: { type: Boolean },

            //Dirty check properties
            _isDirtyCheckHandled: { type: Boolean },
            _dirtyCheckEventName: { type: String },
            _previousSearchedQuery: { type: String },
            _previousSelectedDomain: { type: Object },
            _previousSelectedSource: { type: Object },
            _previousSelectedRel: { type: Object },
            _previousSelectedMappedFilter: { type: Object },

            // context dropdown properties
            _contextDataFormatter: { type: Object },
            _selectedContext: { type: Object },
            _ctxData: { type: Object },
            _isReadyToShowContextPopover: { type: Boolean },
            _contextPebbleIconTitle: { type: String },

            // Attribute filter properties
            attributeModelObject: { type: Object },
            attributeObject: { type: Object },
            originalAttributeModelObject: { type: Object },
            defaultAttributeFilter: { type: String },
            showAttributeFilter: { type: Boolean },
            mode: { type: String },
            displayLimit: { type: Number },
            _isFilterAttributeModelPrepared: { type: Boolean },

            // 1-1 mapping properties
            _temporaryMappingRequests: { type: Array}
        };
    }

    constructor() {
        super();

        this.config = {};
        this.configType = '';
        this.contextData = {};
        this._loading = false;
        this.mappedRelName = 'ismappedto';
        this._userSelectedSource = {};
        this._userSelectedSourceDomain = {};

        this._columns = [];
        this.rowSelection = '';
        this.options = {};
        this._gridOptions = {};
        this._gridConfig = {};
        this._isGridDataEmpty = false;
        this._gridInfo = this.localize('NoResMsg');
        this.pageSize = 50;
        this.batchSize = 50;
        this._actionScope = {};
        this._dataIndex = 'entityData';
        this.maxConfiguredCount = 500;
        this.resultRecordSize = 0;
        this.currentRecordSize = 0;
        this.scopeId = '';
        this._dataSource = {};
        this.expandTreeByDefaultUptoLevel = 1; // -1 - expands all , 0 - Collapse all, 1- 1st level expand, 2 - 2 levels expand
        this.rowBackgroundColor = {
            dragged: '#eaf3fc',
            mapped: '#fff'
        };
        this.invalidateCache = false;
        this._hierarchicalColId = '';
        this._hierarchicalColName = this.localize('TreTxt');
        this._hierarchicalColWidth = 300;

        this._isDomainLovPrepared = false;
        this._domainList = [];
        this._selectedDomain = {};
        this.showDomainFilter = true;

        this._isSourceLovPrepared = false;
        this._sourceList = [];
        this._selectedSource = {};
        this.showSourceFilter = true;
        this.allowMappingOnlyAtLeafNode = true;
        this.showOnlyLeafNodes = true;

        this._relationshipTypes = [];
        this._selectedRelationship = {};
        this.showRelationshipFilter = true;

        this.attributeModels = {};
        this._isRelationshipLovPrepared = false;

        this._mappedFilterItems = [
            {
                id: 'all',
                title: 'Show All',
                value: 'Show All'
            },
            {
                id: 'mapped',
                title: 'Show Mapped',
                value: 'Show Mapped'
            },
            {
                id: 'unmapped',
                title: 'Show UnMapped',
                value: 'Show UnMapped'
            }
        ];
        this._selectedMappedFilter = {};
        this.showMappedFilter = true;

        this._isDirtyCheckHandled = false;
        this._dirtyCheckEventName = '';
        this._previousSearchedQuery = '';
        this._previousSelectedDomain = {};
        this._previousSelectedSource = {};
        this._previousSelectedRel = {};
        this._previousSelectedMappedFilter = {};

        this.actions = {
            'grid-toolbar-action-custom-toolbar-event': {
                name: 'grid-toolbar-action-custom-toolbar-event'
            },
            'bedrock-grid-filter-changed': {
                name: 'bedrock-grid-filter-changed'
            }
        };

        this.globalActions = {
            'rock-search': {
                name: 'rock-search'
            }
        };

        this._contextDataFormatter = () => {};
        this._selectedContext = {
            [DataHelper.getGlobalContext('global').type]: [DataHelper.getGlobalContext('global')]
        };
        this._ctxData = {};
        this._isReadyToShowContextPopover = false;
        this._contextPebbleIconTitle = this.localize('CSConTit');

        this.attributeObject = {
            value: '',
            source: DALCommonUtils.getDefaultSource(),
            locale: DALCommonUtils.getDefaultLocale()
        };
        this.originalAttributeObject = ObjectUtils.cloneObject(this.attributeObject);
        this.attributeModelObject = {};
        this.defaultAttributeFilter = '';
        this.mode = 'edit';
        this.showAttributeFilter = false;
        this.displayLimit = 1;
        this._isFilterAttributeModelPrepared = false;
        this._temporaryMappingRequests = [];
    }

    actionCallback(actionName, detail) {
        switch (actionName) {
            case 'grid-toolbar-action-custom-toolbar-event': {
                this._onToolbarEvent(detail);
                break;
            }
            case 'bedrock-grid-filter-changed': {
                this._onSourceGridFilterChange(detail);
                break;
            }
            case 'rock-search': {
                this._onSearch(detail);
                break;
            }
        }
    }

    _onToolbarEvent(detail) {
        if (detail && detail.actionInfo) {
            switch (detail.actionInfo.name) {
                case 'saveTargetRelMapping':
                    if (detail.scopeId == this.scopeId) {
                        this._onSaveGridData(detail);
                    }
                    break;

                case 'refreshSourceRelMapping': {
                    this.onRefreshSource(detail);
                    break;
                }
                case 'refreshTargetRelMapping':
                    this.onRefreshTarget(detail);
                    break;
                default:
                    break;
            }
        }
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.updateComplete;
        this.scopeId = this.configType + '_dragDropGrid';
        this._contextDataFormatter = entities => {
            return this._contextExternalDataFormatter(entities);
        };
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._contextExternalDataFormatter = undefined;
    }

    get grid() {
        return this.shadowRoot.querySelector('#' + this.configType + '_dragDropGrid');
    }

    get dragDropGrid() {
        if (this.grid) {
            return this.grid?.shadowRoot?.querySelector('pebble-grid');
        }
        return null;
    }

    get domainLov() {
        return this.shadowRoot.querySelector('#' + this.configType + '_domainDropdown');
    }

    get sourceLov() {
        return this.shadowRoot.querySelector('#' + this.configType + '_sourceDropdown');
    }

    get relationshipLov() {
        return this.shadowRoot.querySelector('#' + this.configType + '_relationshipDropdown');
    }

    get contextLov() {
        return this.shadowRoot.querySelector('#' + this.configType + '_contextLov') || null;
    }

    get searchBar() {
        return this.shadowRoot.querySelector('#' + this.configType + '_searchBar');
    }

    get mappedFilterlov() {
        return this.shadowRoot.querySelector('#' + this.configType + '_mappedFilterDropdown');
    }

    get targetToolbarRefreshIcon() {
        return this.shadowRoot
            .querySelector('#target_dragDropGrid')
            ?.shadowRoot.querySelector('grid-toolbar-actions')
            ?.shadowRoot.querySelector('pebble-toolbar')
            ?.shadowRoot.querySelector('#refreshTargetRelMapping');
    }

    getSelectedDomain() {
        return this._selectedDomain;
    }

    getSelectedSource() {
        return this._selectedSource;
    }

    getSelectedRelationship() {
        return this._selectedRelationship;
    }

    getSelectedContext() {
        return this._selectedContext;
    }

    get classificationAttributeName() {
        if (this._selectedDomain?.hasClassifications) {
            return this._selectedDomain?.classificationAttributeName || 'rootexternalname';
        }
        return null;
    }

    get columnAttributes() {
        let columnAttributes = [];
        this._columns.forEach(columnAttribute => columnAttributes.push(columnAttribute.field));
        return columnAttributes || [];
    }

    async firstUpdated() {
        super.firstUpdated();
        this._loading = true;
        //Initialize dropdown items
        if (!ObjectUtils.isEmpty(this.config)) {
            this.showDomainFilter = !ObjectUtils.isEmpty(this.config.showDomainFilter)
                ? this.config.showDomainFilter
                : this.showDomainFilter;
            this.showSourceFilter = !ObjectUtils.isEmpty(this.config.showSourceFilter)
                ? this.config.showSourceFilter
                : this.showSourceFilter;
            this.showRelationshipFilter = !ObjectUtils.isEmpty(this.config.showRelationshipFilter)
                ? this.config.showRelationshipFilter
                : this.showRelationshipFilter;
            this.showMappedFilter = !ObjectUtils.isEmpty(this.config.showMappedFilter)
                ? this.config.showMappedFilter
                : this.showMappedFilter;
            this.allowMappingOnlyAtLeafNode = !ObjectUtils.isEmpty(this.config.allowMappingOnlyAtLeafNode)
                ? this.config.allowMappingOnlyAtLeafNode
                : this.allowMappingOnlyAtLeafNode;
            this.showOnlyLeafNodes = !ObjectUtils.isEmpty(this.config.showOnlyLeafNodes)
                ? this.config.showOnlyLeafNodes
                : this.showOnlyLeafNodes;
            this.rowBackgroundColor = !ObjectUtils.isEmpty(this.config.rowBackgroundColor)
                ? this.config.rowBackgroundColor
                : this.rowBackgroundColor;
            /* Set expandTreeByDefaultUptoLevel as 
                -1 - expands all 
                0 - Collapse all
                1 - 1st level expand
                2 - 2nd levels expand */
            this.expandTreeByDefaultUptoLevel = !ObjectUtils.isEmpty(this.config.expandTreeByDefaultUptoLevel)
                ? this.config.expandTreeByDefaultUptoLevel
                : 1;
            this.excludeSourceTypes = !ObjectUtils.isEmpty(this.config.excludeSourceTypes)
                ? this.config.excludeSourceTypes
                : {};
            this.excludeTargetTypes = !ObjectUtils.isEmpty(this.config.excludeTargetTypes)
                ? this.config.excludeTargetTypes
                : {};
            this.excludeRelationships = !ObjectUtils.isEmpty(this.config.excludeRelationships)
                ? this.config.excludeRelationships
                : [];
            if (this.showMappedFilter && !ObjectUtils.isEmpty(this._mappedFilterItems)) {
                this._setSelectedMappedFilter(this._mappedFilterItems[0]);
            }
            this.pageSize = !ObjectUtils.isEmpty(this.config.pageSize) ? this.config.pageSize : this.pageSize;
            this.batchSize = !ObjectUtils.isEmpty(this.config.batchSize) ? this.config.batchSize : this.batchSize;
            this._configuredDomains = this.config.domains;
            let domainList = _.pluck(this.config.domains, 'name');
            await this._prepareDomains(domainList, this.config.defaultDomain);
            let defaultSource = this.configType == 'source' ? this.config.defaultSource : this.config.defaultTarget;
            await this._prepareSources(defaultSource);
            if (this.showRelationshipFilter) {
                this._prepareRelationshipTypes(this.config.defaultRelationshipType);
            }
            this.prepareContextSelectorData();
            this.disableContextSelector();
            this._reloadGridConfig();
        } else {
            this._loading = false;
            LoggerManager.info('relationship mappings config not found');
        }
    }

    /**
     * When user presses enter, reload grid data with updated attributeCriteria
     */
    async _keyDown(e) {
        if (e && e.keyCode === 13) {
            await this._loadGridOnAttributeChanged();
        }
    }

    async _onAttributeValueChanged(e) {
        if (e && e.detail) {
            const detail = e.detail;
            if (detail.revertClicked) {
                this.attributeObject = ObjectUtils.cloneObject(this.originalAttributeObject);
                await this._loadGridOnAttributeChanged();
                return;
            }

            const displayType = this.attributeModelObject?.displayType;

            // If display type is a textbox, we only want to trigger the search when enter key is pressed.
            if (displayType !== 'textbox') {
                await this._loadGridOnAttributeChanged();
            }
        }
    }

    /**
     * Function to populate the domain dropdown
     */
    async _prepareDomains(domainList, defaultDomain) {
        if (!ObjectUtils.isEmpty(domainList)) {
            let req = DataRequestHelper.createGetModelRequest('domain');
            req.params.query.names = domainList;
            delete req.params.fields.attributes;
            delete req.params.fields.relationships;
            delete req.params.query.ids;
            req.params.fields.properties = ['_ALL'];
            req.params['sort'] = {
                properties: [
                    {
                        name: '_ASC',
                        sortType: Constants.getDataTypeConstant('string')
                    }
                ]
            };
            let url = '/data/pass-through/entitymodelservice/get';
            let domainResponse = await DataObjectManager.rest(url, req);
            if (ObjectUtils.isValidObjectPath(domainResponse, 'response.entityModels.0')) {
                let domains = [];
                let domainModels = domainResponse.response.entityModels;
                domainModels.forEach(function (item) {
                    const configuredDomainObj = _.find(
                        this._configuredDomains,
                        function (confDomain) {
                            return confDomain.name == item.name;
                        },
                        this
                    );
                    if (configuredDomainObj) {
                        const obj = {};
                        obj.id = item.name;
                        obj.title = item.properties?.externalName ? item.properties.externalName : item.name;
                        obj.value = obj.title;
                        obj.hasClassifications = configuredDomainObj.hasClassifications
                            ? configuredDomainObj.hasClassifications
                            : false;
                        obj.classificationAttributeName = configuredDomainObj.classificationAttributeName
                            ? configuredDomainObj.classificationAttributeName
                            : 'rootexternalname';
                        obj.type = configuredDomainObj.type ? configuredDomainObj.type : item.name;
                        obj.manageModelName = configuredDomainObj.manageModelName
                            ? configuredDomainObj.manageModelName
                            : false;
                        if (item.name == defaultDomain) {
                            this._setSelectedDomain(obj);
                        }
                        domains.push(obj);
                    }
                }, this);
                domains = _.sortBy(domains, item => item.title?.toLowerCase());
                this._domainList = domains;
                this._isDomainLovPrepared = true;
            } else {
                LoggerManager.logError(this, 'Failed to fetch domains', domainResponse);
            }
            this._loading = false;
        }
    }

    /**
     * Function to populate the selected and _previousSelected domain (to be used in dirtycheck)
     */
    _setSelectedDomain(obj) {
        this._selectedDomain = {};
        this._previousSelectedDomain = {};
        if (!ObjectUtils.isEmpty(obj)) {
            this._selectedDomain = obj;
            this._previousSelectedDomain = this._createLovSelectedTemplateObj(obj);
            if (this.domainLov && !ObjectUtils.isEmpty(this.domainLov.tagValues)) {
                this._previousSelectedDomain.tagValues = this.domainLov.tagValues;
            }

            // Letting the target grid know the domain selected in source grid
            if (this.configType == 'source') {
                const domainChanged = this.aci.createAction({
                    name: 'domain-changed',
                    detail: {
                        domain: this._selectedDomain
                    }
                });
                this.aci.dispatch(domainChanged);
            }
        }
    }

    /**
     *
     * Method to fetch the model of the configured filter attribute
     */
    async _getFilterAttributeModel() {
        let entityType = this._selectedSource?.id;
        if (this._selectedDomain?.hasClassifications) {
            entityType = this._selectedDomain.manageModelName;
        }
        this._isFilterAttributeModelPrepared = false;
        if (entityType) {
            let clonedContextData = ObjectUtils.cloneObject(this.contextData);
            const filterAttribute = this.defaultAttributeFilter;

            const itemContext = [
                {
                    type: entityType,
                    attributeNames: [filterAttribute]
                }
            ];

            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = itemContext;
            clonedContextData[ContextUtils.CONTEXT_TYPE_VALUE] = [DALCommonUtils.getDefaultValContext()];
            let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);
            compositeModelGetRequest.params.query.filters.typesCriterion = [Constants.CONST_ALL];
            delete compositeModelGetRequest.params.query.name;
            compositeModelGetRequest.params.query.id = `${entityType}_entityCompositeModel`;
            let compositeModel = {};

            try {
                compositeModel = await EntityCompositeModelManager.getCompositeModel(
                    compositeModelGetRequest,
                    clonedContextData
                );
            } catch (error) {
                LoggerManager.logError('Unable to get attribute composite model', error);
            }
            if (ObjectUtils.isValidObjectPath(compositeModel, `data.attributes.${filterAttribute}.properties`)) {
                this.attributeModelObject = compositeModel.data.attributes[filterAttribute].properties;
                // Not mandatory for the user to enter the attribute value, hence setting it as false
                this.attributeModelObject.required = false;
                this._isFilterAttributeModelPrepared = true;
                return;
            }
        }
        ToastManager.showWarningToast(this.localize('AttFilInvTst'));
    }

    /**
     * function to disable context selector / globe icon
     */
    async disableContextSelector() {
        this._loading = true;
        if (!ContextModelManager.isContextModelsPrepared) {
            await ContextModelManager.loadContextModels();
        }
        //reset context
        this._selectedContext = {};
        this._contextPebbleIconTitle = this.localize('CSConTit');

        let disableSelector = true;
        let contextSelectorEl = this.shadowRoot.querySelector('#' + `${this.configType}_contextIcon`);

        if (!ObjectUtils.isEmpty(this._selectedDomain)) {
            const contextTypes = ContextModelManager.getContextTypesBasedOnDomain(this._selectedDomain.id);
            if (contextSelectorEl && !ObjectUtils.isEmpty(contextTypes)) {
                disableSelector = false;
            }
        }

        if (disableSelector) {
            contextSelectorEl?.setAttribute('disabled', '');
        } else {
            contextSelectorEl?.removeAttribute('disabled');
        }

        this._loading = false;
    }

    /**
     * Function to create a template of selected obj of the LOVs from the given obj
     */
    _createLovSelectedTemplateObj(obj) {
        let _lovSelObjTemplate = {};
        if (!ObjectUtils.isEmpty(obj) && obj.title && obj.id) {
            _lovSelObjTemplate.id = obj.id;
            _lovSelObjTemplate.item = obj;
            _lovSelObjTemplate.title = obj.title;
            _lovSelObjTemplate.tagValues = [
                {
                    longName: obj.title,
                    name: obj.title,
                    tagValue: obj.title
                }
            ];
        }
        return _lovSelObjTemplate;
    }

    /**
     * Function to populate the source/target dropdown
     */
    async _prepareSources(defaultSource) {
        this._loading = true;
        this._sourceList = [];
        this._selectedSource = {};
        let sourceList = [];
        if (this._selectedDomain) {
            let excludeTypes =
                this.configType == 'source' && !ObjectUtils.isEmpty(this.excludeSourceTypes)
                    ? this.excludeSourceTypes[this._selectedDomain.id]
                    : this.configType == 'target' && !ObjectUtils.isEmpty(this.excludeTargetTypes)
                    ? this.excludeTargetTypes[this._selectedDomain.id]
                    : [];

            if (this._selectedDomain.hasClassifications) {
                let clonedContextData = ObjectUtils.cloneObject(this.contextData);
                clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [{ type: this._selectedDomain.type }];
                let request = DataRequestHelper.createEntityGetRequest(clonedContextData, true);
                delete request.params.query.id;
                delete request.params.fields.relationshipAttributes;
                delete request.params.fields.relationships;
                //Update attributes, type and ids
                request.params.fields.attributes = ['externalName'];
                let getRequest = DataObjectManager.createRequest('searchandget', request, '', {});
                let getResponse = await DataObjectManager.initiateRequest(getRequest);
                if (getResponse && getResponse.response && getResponse.response.status == 'success') {
                    let entities = getResponse.response?.content?.entities;
                    if (entities) {
                        entities.forEach(function (entity) {
                            //Do not show excluded types
                            if (!ObjectUtils.isEmpty(excludeTypes) && excludeTypes.includes(entity.name)) {
                                return;
                            }
                            let obj = {};
                            let externalName = AttributeUtils.getFirstAttributeValue(
                                entity.data.attributes['externalName']
                            );
                            obj.id = entity.name;
                            obj.title = externalName ? externalName : entity.name;
                            obj.value = externalName ? externalName : entity.name;
                            //Set the selected source
                            if (defaultSource && entity.name === defaultSource) {
                                this._setSelectedSource(obj);
                            }
                            sourceList.push(obj);
                        }, this);
                    }
                }
            } else {
                let sources = await EntityTypeManager.getEntityTypesByDomain(this._selectedDomain.id);
                for (const entityType of sources) {
                    let entityTypeExternalName = EntityTypeManager.getTypeExternalNameById(entityType);
                    //Do not show excluded types
                    if (!ObjectUtils.isEmpty(excludeTypes) && excludeTypes.includes(entityType)) {
                        continue;
                    }
                    let obj = {};
                    obj.id = entityType;
                    obj.title = entityTypeExternalName ? entityTypeExternalName : entityType;
                    obj.value = entityTypeExternalName ? entityTypeExternalName : entityType;
                    sourceList.push(obj);
                    //Set the selected source
                    if (defaultSource && entityType === defaultSource) {
                        this._setSelectedSource(obj);
                    }
                }
            }
        } else {
            LoggerManager.info('No selected domain');
        }

        //Reset the tags if no source is selected
        if (this.sourceLov && ObjectUtils.isEmpty(this._selectedSource)) {
            this.sourceLov.clearValues();
        }
        sourceList = _.sortBy(sourceList, item => item.title?.toLowerCase());
        this._sourceList = sourceList;
        this._isSourceLovPrepared = true;
        this._loading = false;
    }

    /**
     * Function to populate the selected and _previousSelected source/target (to be used in dirtycheck)
     */
    _setSelectedSource(obj) {
        this._selectedSource = {};
        this._previousSelectedSource = {};
        if (!ObjectUtils.isEmpty(obj)) {
            this._selectedSource = obj;
            this._previousSelectedSource = this._createLovSelectedTemplateObj(obj);
            if (this.sourceLov && !ObjectUtils.isEmpty(this.sourceLov.tagValues)) {
                this._previousSelectedSource.tagValues = this.sourceLov.tagValues;
            }
        }

        //Update the source info to the target grid
        if (this.configType == 'source') {
            const sourceChanged = this.aci.createAction({
                name: 'source-changed',
                detail: {
                    source: this._selectedSource
                }
            });
            this.aci.dispatch(sourceChanged);
        }
    }

    /**
     * Function to populate the relationship dropdown
     */
    async _prepareRelationshipTypes(defaultRelationshipType) {
        this._loading = true;
        // reset the mappedRelName to default value when this method is called.
        this.mappedRelName = 'ismappedto';
        this._relationshipTypes = [];
        this._selectedRelationship = {};
        this._isRelationshipLovPrepared = false;
        //Reset the previous relationship lov selection
        if (this.relationshipLov) {
            this.relationshipLov.clearValues();
        }
        const type = this._selectedSource;
        let rels = [];
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        const excludeRelationships = this.excludeRelationships;

        // Get owned relationships of target
        if (type) {
            const ownedRelationships = await RelMappingHelper.getRelationships(
                this._userSelectedSource,
                type,
                this._userSelectedSourceDomain,
                this._selectedDomain,
                clonedContextData,
                'owned'
            );
            if (!ObjectUtils.isEmpty(ownedRelationships)) {
                rels = rels.concat(ownedRelationships);
            }
        } else {
            LoggerManager.info('source not found');
        }

        clonedContextData = ObjectUtils.cloneObject(this.contextData);

        // Get whereused relationships of source
        if (this._userSelectedSource) {
            const whereusedRelationships = await RelMappingHelper.getRelationships(
                type,
                this._userSelectedSource,
                this._selectedDomain,
                this._userSelectedSourceDomain,
                clonedContextData,
                'whereused'
            );
            if (!ObjectUtils.isEmpty(whereusedRelationships)) {
                rels = rels.concat(whereusedRelationships);
            }
        } else {
            LoggerManager.info('source not found');
        }

        if (!ObjectUtils.isEmpty(rels)) {
            this._isRelationshipLovPrepared = true;
        }

        rels = rels.filter(relItem => !excludeRelationships.includes(relItem.value));

        let defaultRelationshipObj = {};
        if (defaultRelationshipType) {
            rels.forEach(relItem => {
                if (defaultRelationshipType === relItem?.relationshipName) {
                    defaultRelationshipObj = relItem;
                }
            });
        }

        if (!ObjectUtils.isEmpty(defaultRelationshipObj)) {
            this._setSelectedRelationship(defaultRelationshipObj);
        }

        this._relationshipTypes = _.sortBy(rels, item => item.title?.toLowerCase());
        this._loading = false;
    }

    /**
     * Function to populate the selected and _previousSelected source/target (to be used in dirtycheck)
     */
    _setSelectedRelationship(obj) {
        this._selectedRelationship = {};
        this._previousSelectedRel = {};
        if (!ObjectUtils.isEmpty(obj)) {
            this._selectedRelationship = obj;
            this._previousSelectedRel = this._createLovSelectedTemplateObj(obj);
            if (this.relationshipLov && !ObjectUtils.isEmpty(this.relationshipLov.tagValues)) {
                this._previousSelectedRel.tagValues = this.relationshipLov.tagValues;
            }
        }
    }

    /**
     * Function to handle domain change from the dropdown
     */
    async _onDomainChange(e) {
        this._selectedDomain = {};
        if (e && e.detail) {
            //_selectedDomain to always hold the current selection of the user
            this._selectedDomain = _.find(this._domainList, function (item) {
                return item.title == e.detail;
            });
        }
        this.disableContextSelector();

        if (!this._isDirtyCheckHandled) {
            let isDirty = await this.performDirtyCheck('domainChange');
            if (isDirty) {
                return;
            }
        }

        //Reset the Source and Relationship LOV
        await this._prepareSources();
        await this._prepareRelationshipTypes();
        await this.prepareContextSelectorData();

        //Reset the mapped filters
        this.resetMappedFilter();

        //The selected value will be updated, if dirty check is passed
        this._setSelectedDomain(this._selectedDomain);

        //Reload the grid
        this._reloadGridConfig();
    }

    /**
     * Function to handle source/target change
     */
    async _onSourceChange(e) {
        this._selectedSource = {};
        if (e && e.detail) {
            //_selectedSource to always hold the current selection of the user
            this._selectedSource = _.find(this._sourceList, function (item) {
                return item.title == e.detail;
            });
        }
        if (!this._isDirtyCheckHandled) {
            let isDirty = await this.performDirtyCheck('sourceChange');
            if (isDirty) {
                return;
            }
        }

        //Reset the Relationship LOV
        await this._prepareRelationshipTypes();

        //Reset the mapped filters
        this.resetMappedFilter();

        this._setSelectedSource(this._selectedSource);

        //Reload the grid
        this._reloadGridConfig();
    }

    /**
     * Function to handle relationship change
     */
    async _onRelationshipTypeChange(e) {
        this._selectedRelationship = {};
        if (e && e.detail) {
            this._selectedRelationship = _.find(this._relationshipTypes, function (item) {
                return item.title == e.detail;
            });
        }

        if (!this._isDirtyCheckHandled) {
            let isDirty = await this.performDirtyCheck('relationshipChange');
            if (isDirty) {
                return;
            }
        }

        this._setSelectedRelationship(this._selectedRelationship);

        //Reset the mapped filters
        this.resetMappedFilter();
        this._loading = true;
        //Reload the grid
        this._onInitialLoad();
    }

    /**
     * Function to handle showMapped dropdown selection change
     */
    async _onMappedFilterChange(e) {
        this._loading = true;
        //Do not trigger the mappedFilter change for the first time as showAll is default
        if (!this.initMappedFilterLoaded) {
            this.initMappedFilterLoaded = true;
            this._loading = false;
            return;
        }
        this._selectedMappedFilter = {};
        if (e && e.detail) {
            let selectedMappedFilter = e.detail;
            if (e.detail.newValue) {
                selectedMappedFilter = e.detail.newValue;
            }
            this._selectedMappedFilter = _.find(this._mappedFilterItems, function (item) {
                return item.title == selectedMappedFilter;
            });
        }

        //Dirty check on mapped filter
        if (!this._isDirtyCheckHandled) {
            let isDirty = await this.performDirtyCheck('mappedFilterChange');
            if (isDirty) {
                return;
            }
        }

        this._setSelectedMappedFilter(this._selectedMappedFilter);
        this._triggerMappedFilterChange();
    }

    /**
     * Function to send an event to handle the mapped filter change
     */
    _triggerMappedFilterChange(isKeywordSearch) {
        //Get the updated entity get request
        this._prepareEntityRequest();
        const mappedFilterChange = this.aci.createAction({
            name: 'mapped-filter-change',
            detail: {
                configType: this.configType,
                mappedFilterId: this._selectedMappedFilter?.id,
                request: ObjectUtils.cloneObject(this._entityDataGetReq)
            }
        });

        //Add the searchText, if searchBar is used with the mapped filters
        if (isKeywordSearch && this.searchBar && ObjectUtils.isValidObjectPath(mappedFilterChange, 'action.detail')) {
            mappedFilterChange.action.detail.searchText = this.searchBar.query;
        }

        this.aci.dispatch(mappedFilterChange);
    }
    /**
     Function to return the color of the globe icon when the user changes the context
    **/
    getContextIconColorClass() {
        const selContextObj = RelMappingHelper.createContextObj(this._selectedContext);
        if (!ObjectUtils.isEmpty(selContextObj)) {
            return 'globe-icon-color';
        } else {
            return '';
        }
    }
    /**
     Function to open popover when pebble-icon:globe is click
    **/
    async openContextPopover(detail) {
        this._isReadyToShowContextPopover = true;
        await this.updateComplete;
        let tagContextPopover = this.getContextPopover();
        if (tagContextPopover) {
            tagContextPopover.positionTarget = detail.currentTarget;
            tagContextPopover.show(true);
        }
    }
    getContextPopover() {
        return this.shadowRoot.querySelector('#' + this.configType + '_contextPopover');
    }
    _contextExternalDataFormatter(formattedData) {
        if (!ObjectUtils.isEmpty(formattedData)) {
            DataObjectSortUtils.sort(formattedData, 'title');
            let globalContextData = DataHelper.getGlobalContext('global');
            formattedData.unshift(globalContextData);
        }
        return formattedData;
    }
    async _onContextLovConfirmButtonTapped() {
        this._selectedContext = {};
        let contextLov = this.shadowRoot.querySelector('#' + this.configType + '_contextLov');
        if (contextLov) {
            let selectedItem = contextLov.selectedItem;
            let context = {};

            context[selectedItem.type] = selectedItem.title;

            if (ObjectUtils.compareObjects(context, this.context)) {
                this.closeContextPopover();
                return;
            }
            this.context = context;
            this._contextPebbleIconTitle = this.context[Object.keys(this.context)];
            // await this.updateComplete;
            this.closeContextPopover();
            let type = selectedItem.type;
            if (type == 'country') {
                this._selectedContext = { country: [selectedItem] };
            } else if (type == 'channel') {
                this._selectedContext = { channel: [selectedItem] };
            } else {
                this._selectedContext = { global: [selectedItem] };
            }
            if (!this._isDirtyCheckHandled) {
                let isDirty = await this.performDirtyCheck('contextChange');
                if (isDirty) {
                    return;
                }
            } else {
                this.loadGridBasedOnSelectedContext();
            }
        }
    }
    closeContextPopover() {
        let tagContextPopover = this.getContextPopover();
        if (tagContextPopover) {
            tagContextPopover.hide();
        }
        this._isReadyToShowContextPopover = false;
    }
    async prepareContextSelectorData() {
        if (!ContextModelManager.isContextModelsPrepared) {
            await ContextModelManager.loadContextModels();
        }
        const domain = this._selectedDomain?.id;
        let types = ContextModelManager.getContextTypesBasedOnDomain(domain);
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        // If the source Domain hasClassifications, then use the manageModelName as the type.
        if (this._userSelectedSourceDomain.hasClassifications) {
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [
                { type: this._userSelectedSourceDomain.manageModelName, attributeNames: '_ALL' }
            ];
        } else {
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [
                { type: this._userSelectedSource.id, attributeNames: '_ALL' }
            ];
        }
        clonedContextData[ContextUtils.CONTEXT_TYPE_VALUE] = [DALCommonUtils.getDefaultValContext()];
        let reqData = DataRequestHelper.createEntityGetRequest(clonedContextData);
        reqData.params.query.filters.typesCriterion = types;
        reqData.params.fields.attributes = ['_ALL'];
        reqData.params.query.valueContexts.push(DALCommonUtils.getDefaultValContext());
        let rData = {
            id: 'context',
            title: this.localize('CSConTit'),
            ctxName: 'context',
            dataRequest: reqData,
            multiSelect: false,
            dataMappings: {
                id: 'name',
                subtitle: 'typeExternalName',
                type: types
            }
        };
        this._ctxData = rData;
    }
    loadGridBasedOnSelectedContext() {
        //Reset the mapped filters
        this.resetMappedFilter();

        //Reload the grid
        this._reloadGridConfig();
        // await this.reloadGrid();
    }

    /**
     * Function to populate the selected and _previousSelected mappedFilter (to be used in dirtycheck)
     */
    _setSelectedMappedFilter(obj) {
        this._selectedMappedFilter = {};
        this._previousSelectedMappedFilter = {};
        if (!ObjectUtils.isEmpty(obj)) {
            this._selectedMappedFilter = obj;
            this._previousSelectedMappedFilter = this._createLovSelectedTemplateObj(obj);
            if (this.mappedFilterlov && !ObjectUtils.isEmpty(this.mappedFilterlov.tagValues)) {
                this._previousSelectedMappedFilter.tagValues = this.mappedFilterlov.tagValues;
            }
        }
    }

    /**
     * Function to send an event to reset showMapped dropdown selection to All for both the source and target grids
     */
    resetMappedFilters(reloadGridName) {
        const resetMappedFilters = this.aci.createAction({
            name: 'reset-mapped-filters',
            detail: {
                gridToReload: reloadGridName
            }
        });
        this.aci.dispatch(resetMappedFilters);
    }

    /**
     * Function to call mapped filter change
     */
    async onMappedFilterChange() {
        let e = { detail: '' };
        e.detail = this._selectedMappedFilter?.title;
        await this._onMappedFilterChange(e);
    }

    /**
     * Function to reset showMapped dropdown selection to All
     */
    resetMappedFilter() {
        if (this.isShowMappedSelected() && this.mappedFilterlov && !ObjectUtils.isEmpty(this._mappedFilterItems)) {
            this.mappedFilterlov.items = this._mappedFilterItems;
            this._setSelectedMappedFilter(this._mappedFilterItems[0]);
        }
    }

    /**
     * Function to fetch rock-drag-drop-grid based on given domain and source
     */
    _reloadGridConfig() {
        this._loading = true;
        this._actionScope = {};
        let clonedContextData = this._getUserSelectedContextData();
        this._actionScope.contextData = clonedContextData;
        this._actionScope.scopeId = this.scopeId;
        //Fetch the grid config and merge with config
        this.requestConfig('rock-drag-drop-grid', clonedContextData);
    }

    /**
     * Function to user selected context info including domain/item and value context
     */
    _getUserSelectedContextData() {
        const domain = this._selectedDomain ? this._selectedDomain.id : '';
        const source = this._selectedSource ? this._selectedSource.id : '';
        const selectedCtxObj = RelMappingHelper.createContextObj(this._selectedContext);
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        if (!ObjectUtils.isEmpty(domain)) {
            clonedContextData[ContextUtils.CONTEXT_TYPE_DOMAIN] = [{ domain: domain }];
        }
        if (!ObjectUtils.isEmpty(source)) {
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [{ type: source }];
        }
        if (!ObjectUtils.isEmpty(selectedCtxObj)) {
            clonedContextData[ContextUtils.CONTEXT_TYPE_DATA] = [selectedCtxObj];
        }

        clonedContextData[ContextUtils.CONTEXT_TYPE_VALUE] = [DALCommonUtils.getDefaultValContext()];

        return clonedContextData;
    }

    /**
     * Function to update the grid's item config based on user selected context data
     */
    onConfigLoaded(componentConfig) {
        if (componentConfig && componentConfig.config) {
            //Update the column names from source/target
            if (
                ObjectUtils.isValidObjectPath(componentConfig, 'config.' + this.configType + '.gridConfig.itemConfig')
            ) {
                componentConfig = componentConfig.config[this.configType];
                const itemConfig = componentConfig.gridConfig.itemConfig;
                const properties = componentConfig?.properties;
                this._hierarchicalColId = properties?.hierarchicalColId;
                this._hierarchicalColName = properties?.hierarchicalColName || this.localize('TreTxt');
                this._hierarchicalColWidth = properties?.hierarchicalColWidth || 300;
                this.defaultAttributeFilter = properties?.defaultAttributeFilter || this.config?.defaultAttributeFilter;
                this.showAttributeFilter = this.config.showAttributeFilter;
                if (this.config && itemConfig) {
                    this.config.gridConfig.itemConfig = itemConfig;
                }
            }
        }
        this._treeTypeChanged();
        this._onInitialLoad();
    }

    listen(node, eventName, handler) {
        node.addEventListener(eventName, handler);
    }

    unlisten(node, eventName, handler) {
        node.removeEventListener(eventName, handler);
    }

    /**
     * Populate the gridoptions & actioncallbacks based on the configurations
     */
    _treeTypeChanged() {
        if (this.config && this.config.treeType) {
            if (this.config.treeType == 'flat') {
                let flatOptions = {
                    rowDragManaged: false,
                    rowSelection: this.rowSelection,
                    rowDrag: rowData => !rowData?.isMapped,
                    animateRows: true,
                    customCellRenderers: {
                        customNoRowsOverlay: 'grid-no-rows-overlay'
                    },
                    getRowId: params => {
                        return params.data.id;
                    }
                };
                let _gridOptions = this.options ? this.options : {};
                for (let prop in flatOptions) {
                    _gridOptions[prop] = flatOptions[prop];
                }
                this._gridOptions = _gridOptions;
            } else if (this.config.treeType == 'hierarchical') {
                let hierarchicalOptions = {
                    // Only enable leaf node selection if allowMappingOnlyAtLeafNode is set to true.
                    // Leaf node mapping does not apply to domains not having classifications.
                    isRowSelectable: rowData => {
                        const isLeafNode = rowData?.data?.isLeafNode;
                        const isMapped = rowData?.data?.isMapped;
                        if (this.allowMappingOnlyAtLeafNode && this._selectedDomain?.hasClassifications)
                            return isLeafNode && !isMapped;
                        return !isMapped;
                    },
                    defaultColDef: {
                        flex: 1,
                        resizable: true
                    },
                    // This ensures that the mentioned components will be loaded when they are not loaded by default
                    customCellRenderers: {
                        pebbleButton: 'pebble-button',
                        customNoRowsOverlay: 'grid-no-rows-overlay'
                    },
                    treeData: true,
                    animateRows: true,
                    groupDefaultExpanded: this.expandTreeByDefaultUptoLevel,
                    getRowStyle: params => {
                        if (params.node?.data?.changedDragInfo?.[params?.node?.data?.hierarchyId]?.dragged) {
                            return { background: this.rowBackgroundColor?.dragged };
                        }
                        if (params.node?.data?.isMapped) {
                            return { background: this.rowBackgroundColor?.mapped };
                        }
                    },
                    getDataPath: data => {
                        return data.filePath;
                    },
                    getRowId: params => {
                        return params.data.id;
                    },
                    autoGroupColumnDef: {
                        rowDrag: true,
                        headerName: this._hierarchicalColName,
                        floatingFilter: false,
                        floatingFilterComponentParams: { suppressFilterButton: true },
                        filter: 'agTextColumnFilter',
                        minWidth: this._hierarchicalColWidth
                    },
                    onRowDragEnd: this.onRowDragEnd
                };
                let _gridOptions = this.options ? this.options : {};
                for (let prop in hierarchicalOptions) {
                    _gridOptions[prop] = hierarchicalOptions[prop];
                }
                this._gridOptions = _gridOptions;
            }
        }
    }

    /*_optionsChanged() {
        if (!ObjectUtils.isEmpty(this.options)) {
            let _gridOptions = this.options ? this.options : {};
            for (let prop in this._gridOptions) {
                _gridOptions[prop] = this._gridOptions[prop];
            }
            this._gridOptions = _gridOptions;
        }
    }*/

    /**
     * Function to fetch attributemodels and load the grid data
     */
    async _onInitialLoad() {
        this.attributeModels = {};
        if (!ObjectUtils.isEmpty(this.config)) {
            this._gridConfig = this.config?.gridConfig;
            let attributeNames = this._getAttributeNamesFromConfig();
            this.attributeModels = await this._getAttributeModels(attributeNames);
            this._setColumns();
            if (this.showAttributeFilter) {
                await this._getFilterAttributeModel();
            }
            await this._loadGrid();
        }
    }

    /**
     * Function to fetch attribute names from the grid config
     */
    _getAttributeNamesFromConfig() {
        let attributeNames = [];
        //Get the Source/Target
        if (ObjectUtils.isValidObjectPath(this.config, 'gridConfig.itemConfig.fields')) {
            let _fields = ObjectUtils.convertToArray(this.config.gridConfig.itemConfig.fields);
            attributeNames = _fields.map(item => item.name);
        }
        return attributeNames;
    }

    /**
     * Function to fetch attributemodels
     */
    async _getAttributeModels(attributeNames) {
        if (!ObjectUtils.isEmpty(attributeNames)) {
            let clonedContextData = this._getUserSelectedContextData();
            if (!clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM]) {
                clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [{}];
            }
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM][0].attributeNames = attributeNames;
            if (this._selectedDomain?.manageModelName) {
                clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM][0].type = this._selectedDomain.manageModelName;
            }
            let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);
            let compositeModel = await EntityCompositeModelManager.getCompositeModel(
                compositeModelGetRequest,
                clonedContextData
            );
            if (compositeModel && compositeModel.data) {
                return DataTransformHelper.transformAttributeModels(compositeModel, clonedContextData);
            }
        }

        return {};
    }

    /**
     * Function to set/sort grid columns
     */
    async _setColumns() {
        let itemConfig = this.config.gridConfig.itemConfig;
        let columns = [];
        let fields = itemConfig ? itemConfig.fields : undefined;
        let defaultSort = itemConfig && itemConfig.sort ? itemConfig.sort.default : undefined;
        if (fields) {
            for (let fieldKey in fields) {
                let field = fields[fieldKey];
                if (field) {
                    this._updateColumns(field, columns, defaultSort);
                }
            }
            if (columns) {
                columns = _.sortBy(columns, function (item) {
                    return item.displaySequence;
                });
            }
        }
        // if (this.config.treeType == 'flat') {
        //     columns[0].rowDrag = true;
        // }

        //Create action and info columns if configured
        if (this.config.gridConfig.showUnlinkActionInfo) {
            const gridRowActionsColumn = this._createGridRowActionsColumn();
            const gridRowStatusColumn = this._createGridRowStatusColumn();
            columns = [...[gridRowActionsColumn], ...[gridRowStatusColumn], ...columns];
        }
        this._columns = columns;
    }

    /**
     * Function to update grid columns
     */
    _updateColumns(field, columns, defaultSort) {
        if (field && field.name) {
            let headerName =
                this.attributeModels[field.name] && this.attributeModels[field.name].externalName
                    ? this.attributeModels[field.name].externalName
                    : field.name;
            let column = {
                headerName: field.header ? field.header : headerName,
                field: field.name,
                tooltipField: field.iconColumn ? '' : field.name,
                headerTooltip: field.header,
                isMetaDataColumn: field.isMetaDataColumn,
                sortable: field.sortable,
                width: field.width,
                icon: field.icon,
                iconTooltip: field.iconTooltip,
                filterable: field.filterable || this.config.gridConfig.bulkEditMode,
                displaySequence: field.displaySequence,
                displayType: field.displayType,
                iconColumn: field.iconColumn,
                linkTemplate: field.linkTemplate,
                headerDescription: this._extractHeaderDescription(field),
                gridColDef: {},
                attrModel: {},
                pinned: field.pinned
            };

            //Default sort
            if (!ObjectUtils.isEmpty(defaultSort)) {
                let sortOption = defaultSort.find(v => v.field == field.name);
                if (!ObjectUtils.isEmpty(sortOption)) {
                    column.sort = sortOption.sortType;
                }
            }
            if (field.isLinkColumn && field.linkTemplate) {
                column.cellRenderer = 'pebbleGridLinkCell';
                column.cellRendererParams = params => {
                    return {
                        params: params
                    };
                };
            }

            if (field.hide) {
                column.hide = true;
            }

            columns.push(column);
        }
    }

    /*
     * Create an action column for grid.
     */
    _createGridRowActionsColumn() {
        return {
            headerName: '',
            field: 'relmap_grid_row_actions',
            suppressMovable: true,
            isGridRowActionColumn: true,
            sortable: false,
            suppressClickEdit: true,
            suppressSizeToFit: true,
            fixedColumnWidth: true,
            menuTabs: [],
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            lockPosition: true,
            pinned: true,
            cellRenderer: 'pebbleButton',
            cellRendererParams: params => {
                if (params?.data?.isMapped) {
                    return {
                        icon: 'pebble-icon:action-delete',
                        buttonText: '',
                        hidden: false,
                        onTap: e => {
                            this._onDeleteMappingButtonClick(e, params);
                        }
                    };
                }
            }
        };
    }

    /*
     * Create an status column for grid.
     */
    _createGridRowStatusColumn() {
        return {
            headerName: this.localize('InfCapTxt'),
            field: 'relmap_grid_row_status',
            suppressMovable: true,
            isGridRowActionColumn: true,
            sortable: false,
            suppressClickEdit: true,
            suppressSizeToFit: true,
            fixedColumnWidth: true,
            menuTabs: [],
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            lockPosition: true,
            pinned: true,
            cellRenderer: params => {
                if (!ObjectUtils.isEmpty(params?.data?.action)) {
                    let infoIconTitle = '';
                    let infoIcon = '';
                    if (params.data.action == 'link') {
                        infoIconTitle = this.localize('LinRTTT');
                        infoIcon = 'pebble-icon:action-add';
                    } else if (params.data.action == 'unlink') {
                        infoIconTitle = this.localize('UnlkTxt');
                        infoIcon = 'pebble-icon:action-delete';
                    }
                    return (
                        "<pebble-button buttonText='' title='" +
                        infoIconTitle +
                        "' icon='" +
                        infoIcon +
                        "'></pebble-button>"
                    );
                }
                return '';
            }
        };
    }

    /**
     * Function to extract header desc
     */
    _extractHeaderDescription(attributeModel) {
        let descriptionObject = {};
        if (attributeModel && attributeModel.properties) {
            descriptionObject.description = attributeModel.properties.description;
        }
        return descriptionObject;
    }

    /**
     * Function to prepare data request and set datasource
     */
    async _loadGrid() {
        if (!ObjectUtils.isEmpty(this.contextData) && !ObjectUtils.isEmpty(this._columns)) {
            this._loading = true;
            this._temporaryMappingRequests = [];
            this._prepareEntityRequest();
            //If _entityDataGetReq is not prepared, then show empty grid
            if (ObjectUtils.isEmpty(this._entityDataGetReq)) {
                this._showEmptyGrid();
                return;
            }
            await this._setGridDataSource(this._columns);
        }
        this._loading = false;
    }

    /**
     * On attribute value change, if show mapped filter is selected, we trigger the mappedFilterChange since the grid data should honor the mapped filter
     */
    async _loadGridOnAttributeChanged() {
        if (this.isShowMappedSelected()) {
            this._loading = true;
            this._triggerMappedFilterChange();
        } else {
            await this._loadGrid();
        }
    }

    /**
     * Function to set the grid with given items
     * Remove Datasource and make the grid render with clientside data
     */
    loadGridWithGivenItems(items) {
        this.grid.items = items;
        this._loading = false;
    }

    /**
     * Function to prepare entity get request
     */
    _prepareEntityRequest() {
        let clonedContextData = this._getUserSelectedContextData();
        if (ObjectUtils.isEmpty(clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM])) {
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [{}];
        }
        if (ObjectUtils.isValidObjectPath(clonedContextData, ContextUtils.CONTEXT_TYPE_ITEM + '.0')) {
            let attributeNames = this._getAttributeNamesFromConfig();
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM][0].attributeNames = attributeNames;
        }
        if (!ObjectUtils.isEmpty(clonedContextData)) {
            this._entityDataGetReq = DataRequestHelper.createEntityGetRequest(clonedContextData);
            this._entityDataGetReq.params.fields.relationships = ['_ALL'];
            if (!ObjectUtils.isEmpty(this._selectedRelationship.relationshipName)) {
                this._entityDataGetReq.params.fields.relationships = [this._selectedRelationship?.relationshipName];
            }
            this._entityDataGetReq.params.fields.relationshipAttributes = [];
            if (!ObjectUtils.isEmpty(this._entityDataGetReq)) {
                //Build the attributesCriterion for source/target dropdown
                if (!ObjectUtils.isEmpty(this._selectedDomain)) {
                    // types criterion changes based on hasClassifications flag
                    if (this._selectedDomain.hasClassifications) {
                        if (
                            ObjectUtils.isValidObjectPath(
                                this._entityDataGetReq,
                                'params.query.filters.typesCriterion'
                            ) &&
                            this._selectedDomain.manageModelName
                        ) {
                            this._entityDataGetReq.params.query.filters.typesCriterion = [
                                this._selectedDomain.manageModelName
                            ];
                        }

                        if (!ObjectUtils.isEmpty(this._selectedSource)) {
                            let _attributesCriterionObj = {};
                            _attributesCriterionObj[this.classificationAttributeName] = {
                                exact: this._selectedSource.id,
                                type: '_STRING'
                            };
                            this._entityDataGetReq.params.query.filters.attributesCriterion = [_attributesCriterionObj];
                        }
                    } else {
                        if (!ObjectUtils.isEmpty(this._selectedSource)) {
                            this._entityDataGetReq.params.query.filters.typesCriterion = [this._selectedSource.id];
                        }
                        if (
                            !ObjectUtils.isEmpty(this._selectedContext) &&
                            !RelMappingHelper.isGlobalContext(this._selectedContext)
                        ) {
                            const selectedContext = RelMappingHelper.createContextObj(this._selectedContext);
                            this._entityDataGetReq.params.query.contexts = [selectedContext];
                            this._entityDataGetReq.params.query.filters.nonContextual = false;
                        }
                    }
                }

                // Build attributeCriterion for attribute filter input
                if (!ObjectUtils.isEmpty(this.attributeObject.value)) {
                    let _attributesCriterionObj = {};
                    const displayType = this.attributeModelObject?.displayType;
                    let attributeFilterValue = this.attributeObject.value;

                    if (attributeFilterValue) {
                        // Adding special character if the attribute is a text to maintain consistency with search page
                        if (displayType === 'textbox' || displayType === 'textarea') {
                            attributeFilterValue = attributeFilterValue + '*';
                        }

                        _attributesCriterionObj[this.defaultAttributeFilter] = {
                            eq: attributeFilterValue
                        };

                        if (!this._entityDataGetReq.params.query.filters.attributesCriterion) {
                            this._entityDataGetReq.params.query.filters.attributesCriterion = [];
                        }
                        this._entityDataGetReq.params.query.filters.attributesCriterion.push(_attributesCriterionObj);
                    }
                }

                //Build the keywordCriterion for searchbar input
                if (this.searchBar && !ObjectUtils.isEmpty(this.searchBar.query)) {
                    let searchQuery = this.searchBar.query;
                    let keywordsCriterion = RelMappingHelper.buildKeywordsCriterion(searchQuery);
                    if (!ObjectUtils.isEmpty(keywordsCriterion)) {
                        this._entityDataGetReq.params.query.filters.keywordsCriterion = keywordsCriterion;
                    }
                }
            }
        }
    }

    /**
     * Function to set grid datasource
     */
    async _setGridDataSource() {
        if (this.grid) {
            let responseFormatter = data => {
                return this.getAttributeFormattedData(data);
            };

            //Needed for lazy loaded grid
            /*let cb = () => {
                this._updateGridInfo();
                this.invalidateCache = false;
            };*/

            let dataSourceParams = {
                request: this._entityDataGetReq,
                pageSize: this.pageSize,
                batchSize: this.batchSize,
                isCombinedGetReq: false,
                dataIndex: this._dataIndex
            };

            this._dataSource = new EntityGridDataSource(dataSourceParams);
            let clonedContextData = this._getUserSelectedContextData();
            let requestHandler = async requestOptions => {
                if (this.maxConfiguredCount) {
                    requestOptions.maxRecords = this.maxConfiguredCount;
                }
                //Sorting by last updated column, so that recently updated entity appears within the loaded data
                requestOptions.sortModel = [
                    {
                        isMetaDataColumn: true,
                        colId: 'modifiedDate',
                        sort: 'desc'
                    }
                ];
                this.invalidateCache = true;
                let responseData = {};
                try {
                    responseData = await this._dataSource.requestHandler(
                        requestOptions,
                        this.attributeModels,
                        clonedContextData,
                        this.config.gridConfig,
                        this.invalidateCache
                    );
                } catch (error) {
                    LoggerManager.logError(this, 'Failed to fetch search results for the given criteria', error);
                }

                if (responseData && responseData.status == 'success') {
                    return responseData;
                } else {
                    LoggerManager.logError(this, 'Failed to fetch search results for the given criteria', responseData);
                    this._showEmptyGrid();
                    return [];
                }
            };

            /*
            //For making the source grid lazy loaded
            if (this.configType == 'source') {
                //Fetching source grid data dynamically lazy loaded
                this.grid.dataSource = new BedrockGridDataSource(
                    requestHandler,
                    responseFormatter,
                    this.pageSize,
                    this.maxConfiguredCount,
                    cb
                );
            }*/
            //Making the grid client side model
            let params = {
                startRow: 0,
                endRow: this.pageSize ? this.pageSize - 1 : this.pageSize,
                clientSideModel: true
            };

            let bedrockGridData = new BedrockGridDataSource(requestHandler, responseFormatter);
            let items = await bedrockGridData.getData(params);
            if (this.grid) {
                this.grid.items = items;
            }
        }
    }

    /**
     * Function to dynamically update the grid items count
     */
    _updateGridInfo() {
        if (this.grid) {
            this.currentRecordSize = 0;
            this.currentRecordSize = this.grid.dataSource.currentRecordSize;
        }
    }

    /**
     * Function to format data
     */
    async getAttributeFormattedData(data) {
        let formattedEntities = [];
        let clonedContextData = this._getUserSelectedContextData();
        //let defaultAttributes = ['type', 'id'];
        //let thumbnailIdFound = false;
        if (data && data.content) {
            //The target grid is static and tree type, hence the total records count will be auto calculated
            /*if (this.configType == 'source') {
                this.resultRecordSize =
                    data.resultRecordSize != undefined ? data.resultRecordSize : this.resultRecordSize;
            }*/
            let entities;
            if (data.content.entities) {
                entities = data.content.entities;
            } else if (data.content.entityModels) {
                entities = data.content.entityModels;
            }
            if (entities && entities.length > 0) {
                formattedEntities = await DataTransformHelper.transformEntitiesToGridFormat(
                    entities,
                    this.attributeModels,
                    clonedContextData,
                    this._getGridColumns(this.config.gridConfig),
                    true,
                    'grid'
                );
                /* for (let i = 0; i < formattedEntities.length; i++) {
                        let imageObj = EntityUtils.getEntityImageObject(
                            formattedEntities[i],
                            this._previewAssetAttribute,
                            clonedContextData
                        );
                        if (!ObjectUtils.isEmpty(imageObj)) {
                            if (imageObj.value) {
                                thumbnailIdFound = true;
                                break;
                            }
                        }
                    }*/
            }
        }

        formattedEntities = await this.transformData(this._columns, formattedEntities);
        this._isGridDataEmpty = false;
        if (ObjectUtils.isEmpty(formattedEntities)) {
            this._isGridDataEmpty = true;
        }
        return formattedEntities;
    }

    /**
     * Function to show empty grid
     */
    _showEmptyGrid() {
        //Equating grid items to empty object instead of empty array to prevent the grid to loose dropzone
        if (this.grid) {
            if (!ObjectUtils.isEmpty(this.grid.items)) {
                this.grid.items = {};
            }
            //Needed if the grid data is lazy loaded
            //this.grid.dataSource = {};
        }

        this.resultRecordSize = 0;
        this.currentRecordSize = 0;
        this._isGridDataEmpty = true;
        this._loading = false;
    }

    /**
     * Function to get grid columns
     */
    _getGridColumns(gridConfig) {
        if (gridConfig && gridConfig.tabular && gridConfig.tabular.columns) {
            return this.config.gridConfig.tabular.columns;
        }
        let columns = [];
        if (ObjectUtils.isValidObjectPath(gridConfig, 'itemConfig.fields')) {
            columns = ObjectUtils.convertToArray(gridConfig.itemConfig.fields);
        }
        return columns;
    }

    /*
        Method to get the external name attribute (which has isExternalName : true) to display as entity name in the grid
    */
    async _getExternalNameAttribute(entityType) {
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [{ type: entityType }];
        let request = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);
        let modelResponse = {};

        if (request) {
            request.params.fields.attributes = ['_ALL'];
            modelResponse = await EntityCompositeModelManager.getCompositeModel(request, clonedContextData, true);
        }

        let attributes = modelResponse?.data?.attributes;

        if (attributes) {
            for (let key in attributes) {
                if (attributes[key].properties && attributes[key].properties.isExternalName) {
                    return key;
                }
            }
        }
    }

    /**
     * Function to transform data into drag drop grid format
     */
    async transformData(columns, entities) {
        let data = [];

        // MappedRelName is used to fetch the entities mapped under an entity for the selected relationship
        if (
            !ObjectUtils.isEmpty(this._selectedRelationship?.relationshipName) &&
            !this._selectedDomain.hasClassifications
        ) {
            this.mappedRelName = this._selectedRelationship?.relationshipName;
        }

        let sourceEntityExternalAttributeName = '';
        if (this.configType === 'target') {
            const entityType = this._userSelectedSourceDomain?.hasClassifications
                ? this._userSelectedSourceDomain?.manageModelName
                : this._userSelectedSource?.id;
            sourceEntityExternalAttributeName = await this._getExternalNameAttribute(entityType);
        }

        // Get the mapped entities of all the parent level entities. This is done for optimization purpose. Instead of fetching the mapped entities individually, we handle it in one request.
        let mappedEntities = [];
        let mappedEntitiesData = [];
        let relToType = '';
        if (this.configType === 'target') {
            relToType = this._userSelectedSource.id;
            if (this._userSelectedSourceDomain?.hasClassifications) {
                relToType = this._userSelectedSourceDomain?.manageModelName;
            }
            mappedEntities = RelMappingHelper.getMappedToRelIdsFromEntities(entities, this.mappedRelName, relToType);
            mappedEntitiesData = await this._getMappedEntitiesData(mappedEntities, sourceEntityExternalAttributeName);
        }

        let clonedContextData = this._getUserSelectedContextData();
        if (!ObjectUtils.isEmpty(columns)) {
            for (let entity of entities) {
                let attributes = entity.attributes;
                if (attributes) {
                    let rowData = {};
                    rowData.id = entity.id;
                    rowData.type = entity.type;
                    rowData.entityType = entity.type;
                    rowData.typeExternalName = entity.typeExternalName;
                    if(this.configType === "source" && mappedSourceEnti){}
                    rowData.name = entity.name;
                    let attrModels = this.attributeModels;
                    let firstDataContext = ContextUtils.getFirstDataContext(clonedContextData);
                    let entityAttributes = EntityUtils.getAttributesBasedOnContext(entity, firstDataContext);
                    let attributeObj = attributes[firstDataContext] ? attributes[firstDataContext] : {};
                    for (let column of columns) {
                        let colId = column.field;
                        let colFieldName = column.field ? column.field : '';
                        let attrModel = attrModels && attrModels[colId];
                        let filePath = [];
                        let filePathInString = '';
                        let _isPathExist = false;
                        if (ObjectUtils.isEmpty(attrModel)) {
                            attrModel = attrModels[colFieldName];
                        }
                        if (!ObjectUtils.isEmpty(attrModels) && !ObjectUtils.isEmpty(attrModels[colFieldName])) {
                            attrModels[colId] = attrModels[colFieldName];
                            let attributeModel = attrModels[colId];
                            if (!ObjectUtils.isEmpty(attributeModel)) {
                                attributeObj = attributes[colFieldName] ? attributes[colFieldName] : {};
                                let attributeValue = attributeModel.isCollection ? [] : '';
                                if (
                                    !ObjectUtils.isEmpty(attributeObj) &&
                                    ObjectUtils.isValidObjectPath(entityAttributes, `${colFieldName}.values`)
                                ) {
                                    let valContexts = ContextUtils.getValueContexts(clonedContextData);
                                    valContexts[0].locale = column.locale;
                                    let attributeValues = AttributeUtils.getAttributeValues(
                                        entityAttributes[colFieldName].values,
                                        valContexts[0]
                                    );
                                    attributeValue = attributeModel.isCollection ? attributeValues : attributeValues[0];
                                }
                                if (colId === this._hierarchicalColId && this.config.treeType === 'hierarchical') {
                                    filePathInString = attributeValue;
                                    filePath = attributeValue.split('>>');
                                    _isPathExist = true;
                                }
                                attributes[colId] = {
                                    ...attributeObj,
                                    value: attributeValue,
                                    locale: column.locale
                                };
                            }
                        }
                        rowData[colId] = attributes[colId] ? attributes[colId].value : '';
                        //TODO : handle the entities that does not have path
                        if (_isPathExist) {
                            let previousFilePathStrings = data.map(item => item.filePathInString);
                            let newRows = this.createHierarchicalData(filePathInString, previousFilePathStrings);
                            data = [...data, ...newRows];
                            rowData['filePathInString'] = filePathInString;
                            rowData['filePath'] = filePath;
                            rowData['type'] = 'file';
                            rowData.isMapped = false;
                            rowData.isLeafNode = false;

                            /* To show all the mapped nodes on the grid, we get the ids of all the entities that has been mapped to the current entity in the iteration and get the fields required to show the mapped entity on the grid.
                             */
                            let mappedIds = RelMappingHelper.getMappedToRelIdsFromEntities(
                                [entity],
                                this.mappedRelName,
                                relToType
                            );
                            if (!ObjectUtils.isEmpty(mappedIds)) {
                                let mappedRows = this._getMappedRows(
                                    mappedEntitiesData,
                                    mappedIds,
                                    rowData,
                                    sourceEntityExternalAttributeName
                                );
                                // If there is no mappedRow for an entity, then don't list it in the grid.
                                if (this._selectedMappedFilter.id === 'mapped' && ObjectUtils.isEmpty(mappedRows)) {
                                    rowData = {};
                                }
                                if (!ObjectUtils.isEmpty(mappedRows)) {
                                    data = [...data, ...mappedRows];
                                }
                            }
                        }
                    }
                    if (!ObjectUtils.isEmpty(rowData)) {
                        data.push(rowData);
                    }
                }
            }
        }

        // Mark the rows that do not have any children as leaf nodes.
        if (this.configType === 'target' && this._selectedDomain?.hasClassifications) {
            await this.enableLeafNodeFlagForLeafNodes(data);
        }

        if (this._selectedDomain?.hasClassifications && this.configType === 'target' && this.showOnlyLeafNodes) {
            // Updating the path of the rows if the user wants to see only the leafNodes.
            // The tree strucuture for each row is built based on the property 'filePath', so we update that property.
            let updatedData = [];
            for (let rowData of data) {
                if (rowData.isLeafNode) {
                    const filePath = rowData.filePath;
                    rowData.filePath = filePath?.slice(filePath.length - 1, filePath.length);
                    updatedData.push(rowData);
                }
                if (rowData.isMapped) {
                    const filePath = rowData.filePath;
                    rowData.filePath = filePath?.slice(filePath.length - 2, filePath.length);
                    updatedData.push(rowData);
                }
            }
            data = updatedData;
        }

        this.originalData = ObjectUtils.cloneObject(data);
        return data;
    }

    async _getMappedEntitiesData(entityIds, sourceEntityExternalAttributeName) {
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        const type = this._userSelectedSourceDomain?.hasClassifications
            ? this._userSelectedSourceDomain?.manageModelName
            : this._userSelectedSource?.id;
        let attributeNames = [sourceEntityExternalAttributeName, ...this.columnAttributes];

        // If source is classification domain entity and target is business domain then we need to include the classificationAttrName as well, this attribute is later used to render mapped rows
        if (this._userSelectedSourceDomain?.hasClassifications) {
            attributeNames.push(this._userSelectedSourceDomain?.classificationAttributeName);
        }

        const itemContext = [
            {
                type: type,
                id: entityIds,
                attributeNames: attributeNames
            }
        ];

        clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = itemContext;
        clonedContextData[ContextUtils.CONTEXT_TYPE_VALUE] = [DALCommonUtils.getDefaultValContext()];

        // dalReqOptions.batchSize helps in getting data in batches. This reduces the load on the system and is an optimized way of fetching the data.
        let dalReqOptions = {};
        dalReqOptions.batchSize = this.batchSize;
        dalReqOptions.objectsCollectionName = 'entities';
        dalReqOptions.dataIndex = 'entityData';

        const request = DataRequestHelper.createEntityGetRequest(clonedContextData);
        let getRequest = DataObjectManager.createRequest('searchandget', request, '', dalReqOptions);
        let getResponse = await DataObjectManager.initiateRequest(getRequest);
        if (getResponse && getResponse.response && getResponse.response.status == 'success') {
            let entities = getResponse.response?.content?.entities;
            return entities;
        }
        return [];
    }

    /*
        Function to get the mapped rows
    */
    _getMappedRows(mappedEntitiesData, mappedIds, rowData, externalNameAttribute) {
        let mappedRows = [];
        let entites = ObjectUtils.cloneObject(mappedEntitiesData);
        entites = entites.filter(entity => mappedIds.includes(entity.id));
        for (const entity of entites) {
            let entityType = entity.type;
            if (this._userSelectedSourceDomain.hasClassifications) {
                entityType = AttributeUtils.getFirstAttributeValue(
                    entity.data.attributes[this._userSelectedSourceDomain?.classificationAttributeName]
                );
            }
            // Need this extra check because we need to make sure the mapped entities belong to the entity type selected in source grid
            if (this._userSelectedSource.id === entityType) {
                const mappedRow = this.createHierarchicalDataForMappedItems(entity, rowData, externalNameAttribute);
                mappedRows.push(mappedRow);
            }
        }
        return mappedRows;
    }

    /**
     * Function to create the strucuture required to render the mapped rows on the grid.
     */
    createHierarchicalDataForMappedItems(mappedItem, parentData, externalNameAttribute) {
        let rowData = {};
        let attributes = mappedItem?.data?.attributes;

        this.columnAttributes.forEach(colAttribute => {
            if (attributes[colAttribute]) {
                rowData[colAttribute] = AttributeUtils.getFirstAttributeValue(attributes[colAttribute]);
            }
        });

        rowData.id = mappedItem.id;
        rowData.type = 'file';
        rowData.entityType = mappedItem.type;
        rowData.droppedToId = parentData.id;
        rowData.droppedToRel = this.mappedRelName;
        rowData.droppedToPath = parentData.filePathInString;
        rowData.droppedToExternalName = parentData.name;
        rowData.isMapped = true;
        rowData.name = mappedItem.name ? mappedItem.name : mappedItem.id;
        rowData.typeExternalName = mappedItem.typeExternalName;
        const extName = AttributeUtils.getFirstAttributeValue(attributes[externalNameAttribute]);
        rowData.externalName = !ObjectUtils.isEmpty(extName) ? extName : rowData.name;

        let mappedPath = parentData.filePathInString;
        mappedPath += '>>';
        mappedPath += rowData.externalName;
        rowData.filePath = mappedPath.split('>>');

        if (this._userSelectedSourceDomain.hasClassifications) {
            rowData[this.classificationAttributeName] = AttributeUtils.getFirstAttributeValue(
                attributes?.[this.classificationAttributeName]
            );
            rowData.externalnamepath = AttributeUtils.getFirstAttributeValue(attributes?.externalnamepath);
            rowData.filePathInString = mappedPath;
        } else {
            const type = EntityTypeManager.getTypeExternalNameById(mappedItem.type);
            rowData.typeExternalName = type ? type : mappedItem.type;
            rowData.externalnamepath = rowData.externalName;
            rowData.filePathInString = mappedPath;
        }
        return rowData;
    }

    /**
     * Function to filter out the possible leaf nodes from the listed rows on target grid.
     */
    filterPossibleLeafNodes(data) {
        let possibleLeafNodes = [];

        // Create a set of all the non-leaf nodes for quick lookup.
        // Note: Mapped row can't be a leaf node
        let nonLeafNodes = new Set();
        data.forEach(rowData => {
            if (!rowData.isMapped && rowData.externalnamepath) {
                const filePath = rowData.externalnamepath.split('>>');
                for (let i = 0; i < filePath.length - 1; i++) nonLeafNodes.add(filePath[i]);
            }
        });

        // If a row is not included in the nonLeafNodes, mark it as a possbileLeafNode
        data.forEach(rowData => {
            if (!rowData?.isMapped && !nonLeafNodes?.has(rowData?.externalName)) {
                possibleLeafNodes.push(rowData.id);
            }
        });
        return possibleLeafNodes;
    }

    /**
     * Function to enable selection only for leaf nodes
     */
    async enableLeafNodeFlagForLeafNodes(data) {
        if (ObjectUtils.isEmpty(data)) return;
        let possibleLeafNodeIds = this.filterPossibleLeafNodes(data);
        let filters = {};
        if (!ObjectUtils.isEmpty(this._selectedDomain)) {
            filters.typesCriterion = [this._selectedDomain?.manageModelName];
            let relationshipCriterionObj = {
                belongsto: {
                    relTo: {
                        ids: possibleLeafNodeIds
                    }
                }
            };
            filters.relationshipsCriterion = [relationshipCriterionObj];
        }

        const belongsToEntityIds = await RelMappingHelper.getBelongsToEntityIds(filters);

        // Remove the nodes which have children
        if (!ObjectUtils.isEmpty(belongsToEntityIds))
            possibleLeafNodeIds = possibleLeafNodeIds?.filter(id => !belongsToEntityIds.has(id));

        // Mark all the nodes in possibleLeafNodeIDs as leafNodes in data.
        data.forEach(rowData => {
            if (possibleLeafNodeIds.includes(rowData.id) && rowData?.type !== 'folder') rowData.isLeafNode = true;
        });
    }

    async _onSearch(detail) {
        //Prevent both grids from loading, search aci event shares the parent Id hence leftGrid and rightGrid is used here
        if (
            (detail && detail.target == 'leftGrid' && this.configType == 'target') ||
            (detail.target == 'rightGrid' && this.configType == 'source')
        ) {
            return;
        }
        this._loading = true;
        if (!this._isDirtyCheckHandled) {
            let isDirty = await this.performDirtyCheck('search');
            if (isDirty) {
                return;
            }
        }

        if (this.searchBar && !ObjectUtils.isEmpty(this.searchBar.query)) {
            this._previousSearchedQuery = this.searchBar.query;
        }

        //Load grid Data based on search text
        await this.reloadGrid(true);
    }

    /**
     * Function to reset the search text
     */
    async _onResetSearchClicked() {
        this._loading = true;
        if (!this._isDirtyCheckHandled) {
            let isDirty = await this.performDirtyCheck('resetSearch');
            if (isDirty) {
                return;
            }
        }

        if (this.searchBar) {
            this.searchBar.searchText = '';
            this.searchBar.query = '';
        }

        //Load grid Data based on search text
        this.reloadGrid();
    }

    /**
     * Function to refresh the target grid data (clientside data)
     */
    async onRefreshTarget(detail) {
        //Ignore unrelated events
        if (detail && detail.scopeId != this.scopeId) return;

        this._loading = true;
        this.invalidateCache = true;
        this._clearNotificationBlinker();

        if (!this._isDirtyCheckHandled) {
            let isDirty = await this.performDirtyCheck('refresh');
            if (isDirty) {
                return;
            }
        }

        this.reloadGrid();
    }

    /**
     * Function to refresh the source grid data
     */
    onRefreshSource(detail) {
        //Ignore unrelated events
        if (detail && detail.scopeId != this.scopeId) return;
        this.onRefreshTarget(detail);
    }

    /**
     * reload the grid with all the filter checks again
     */
    async reloadGrid(isKeywordSearch) {
        if (this.isShowMappedSelected()) {
            this._triggerMappedFilterChange(isKeywordSearch);
        } else {
            await this._loadGrid();
        }
    }

    /**
     * Function to save the updated grid data
     */

    async _onSaveGridData() {
        let changedData = this.getChangedTreeData();

        let action = this.aci.createAction({
            name: 'mapping-save-clicked',
            detail: {
                changedData: changedData,
                manageModelName: this._selectedDomain?.manageModelName
            }
        });
        this.aci.dispatch(action);
    }

    /**
     * Function to check if the page is dirty
     */
    getIsDirty() {
        let changedData = this.getChangedTreeData();
        return !ObjectUtils.isEmpty(changedData) ? true : false;
    }

    isShowMappedSelected() {
        return (
            this.showMappedFilter &&
            !ObjectUtils.isEmpty(this._selectedMappedFilter) &&
            this._selectedMappedFilter.id != 'all'
        );
    }
    /**
     * Function to show dirtyCheck dialog
     */
    async performDirtyCheck(eventName, isControlDirtyCheckDone, isControlDirty) {
        if (
            !isControlDirtyCheckDone &&
            (eventName === 'domainChange' ||
                eventName === 'sourceChange' ||
                eventName === 'relationshipChange' ||
                eventName === 'contextChange')
        ) {
            //Send an event to handle the mapped filter change
            const controlDirtyCheck = this.aci.createAction({
                name: 'control-dirty-check',
                detail: {
                    configType: this.configType,
                    scopeId: this.scopeId,
                    eventName: eventName
                }
            });
            this.aci.dispatch(controlDirtyCheck);
            return true;
        }

        //On Source Change always show a dirty check as target will reload mappedRels based on source
        if (this.configType === 'source' && (eventName === 'sourceChange' || eventName === 'domainChange')) {
            isControlDirty = true;
        }

        //Dirty check on target grid
        let targetIsDirty = false;
        if (this.configType == 'target') {
            targetIsDirty = this.getIsDirty();
        }

        if (isControlDirty || targetIsDirty) {
            this._dirtyCheckEventName = eventName;
            let msg = isControlDirty ? this.localize('ModSeaCriCnfTxt') : this.localize('DisChaWar');
            DialogManager.openConfirm(this, msg);
            return true;
        }

        if (isControlDirtyCheckDone && !isControlDirty && !targetIsDirty) {
            //Continue the event
            this._isDirtyCheckHandled = true;
            this._dirtyCheckEventName = eventName;
            await this._setControlsSelection();
            this._isDirtyCheckHandled = false;
        }

        return false;
    }

    /**
     * Function to handle dirtyCheck confirmation
     */
    async confirmDialogHandler(confirmStatus) {
        this._isDirtyCheckHandled = true;
        if (confirmStatus) {
            //Reset the changed Data
            this.onRemoveTargetGridChangedInfo();
            //Reload the grid that is not reloaded by _setControlsSelection
            let gridToReload = this.configType == 'source' ? 'target' : 'source';
            this.resetMappedFilters(gridToReload);
            await this._setControlsSelection();
        } else {
            this._revertControlsSelection();
        }

        //Reset the flag
        this._isDirtyCheckHandled = false;
    }

    /**
     * Function to set the controls(domain/source/target/rel/mappedfilter/search) with user selected options
     */
    async _setControlsSelection() {
        let e = { detail: '' };
        if (this._dirtyCheckEventName == 'search') {
            this._onSearch();
        } else if (this._dirtyCheckEventName == 'resetSearch') {
            this._onResetSearchClicked();
        } else if (this._dirtyCheckEventName == 'refresh') {
            this.configType == 'target' ? this.onRefreshTarget() : this.onRefreshSource();
        } else if (this._dirtyCheckEventName == 'domainChange') {
            e.detail = this._selectedDomain?.title;
            await this._onDomainChange(e);
        } else if (this._dirtyCheckEventName == 'sourceChange') {
            e.detail = this._selectedSource?.title;
            await this._onSourceChange(e);
        } else if (this._dirtyCheckEventName == 'relationshipChange') {
            e.detail = this._selectedRelationship?.title;
            await this._onRelationshipTypeChange(e);
        } else if (this._dirtyCheckEventName == 'mappedFilterChange') {
            e.detail = this._selectedMappedFilter?.title;
            await this._onMappedFilterChange(e);
        } else if (this._dirtyCheckEventName === 'contextChange') {
            this.loadGridBasedOnSelectedContext();
        }
    }

    /**
     * Function to revert the controls(domain/source/target/rel/mappedfilter/search) with previously selected user options
     */
    _revertControlsSelection() {
        if (this._dirtyCheckEventName == 'search' || this._dirtyCheckEventName == 'resetSearch') {
            this.searchBar.searchText = this._previousSearchedQuery;
            this.searchBar.query = this._previousSearchedQuery;
        } else if (
            this._dirtyCheckEventName == 'domainChange' &&
            this.domainLov &&
            !ObjectUtils.isEmpty(this._previousSelectedDomain)
        ) {
            this._selectedDomain = this._previousSelectedDomain?.item;
            this.domainLov.selectedValue = this._previousSelectedDomain?.title;
            this.domainLov.selectedId = this._previousSelectedDomain?.id;
            this.domainLov.selectedItem = this._previousSelectedDomain?.item;
            this.domainLov.tagValues = this._previousSelectedDomain?.tagValues;
        } else if (this._dirtyCheckEventName == 'sourceChange' && this.sourceLov) {
            this._selectedSource = this._previousSelectedSource?.item;
            this.sourceLov.selectedValue = this._previousSelectedSource?.title;
            this.sourceLov.selectedId = this._previousSelectedSource?.id;
            this.sourceLov.selectedItem = this._previousSelectedSource?.item;
            this.sourceLov.tagValues = this._previousSelectedSource?.tagValues;
        } else if (this._dirtyCheckEventName == 'relationshipChange' && this.relationshipLov) {
            this._selectedRelationship = this._previousSelectedRel?.item;
            this.relationshipLov.selectedValue = this._previousSelectedRel?.title;
            this.relationshipLov.selectedId = this._previousSelectedRel?.id;
            this.relationshipLov.selectedItem = this._previousSelectedRel?.item;
            this.relationshipLov.tagValues = this._previousSelectedRel?.tagValues;
        } else if (this._dirtyCheckEventName == 'mappedFilterChange' && this.mappedFilterlov) {
            this._selectedMappedFilter = this._previousSelectedMappedFilter?.item;
            this.mappedFilterlov.selectedValue = this._previousSelectedMappedFilter?.title;
            this.mappedFilterlov.selectedId = this._previousSelectedMappedFilter?.id;
            this.mappedFilterlov.selectedItem = this._previousSelectedMappedFilter?.item;
            this.mappedFilterlov.tagValues = this._previousSelectedMappedFilter?.tagValues;
        }
    }
    /**
     * Function to get the changed data
     */
    getChangedTreeData() {
        if (this.dragDropGrid && this.dragDropGrid._gridApi) {
            let rowModel = this.dragDropGrid._gridApi.getModel();
            let rootNode = rowModel.getRootNode();
            let treeData = rootNode.allLeafChildren
                .map(node => (node.data && node.data.changedDragInfo ? node.data : undefined))
                .filter(item => item);

            return treeData;
        }
        return;
    }

    _pebbleGridDataLoaded() {
        if (this.dragDropGrid && this.dragDropGrid._gridApi) {
            new CustomEvent('pebble-grid-data-loaded', {
                detail: {},
                bubbles: true,
                composed: true
            });
        }
    }

    /**
     * Drag drop grid functions
     */
    onRowDragEnd = async event => {
        let overNode = event.overNode;

        if (!overNode) {
            return;
        }

        // Disable the user from dnd on non-leaf node if user has enabled to map to only leaf nodes
        if (this._selectedDomain?.hasClassifications && this.allowMappingOnlyAtLeafNode && !overNode.data.isLeafNode) {
            ToastManager.showErrorToast(this.localize('MapLeaOnlMsg'));
            return;
        }

        //Disable user from mapping to already mapped nodes
        if (overNode.data.isMapped) {
            ToastManager.showErrorToast(this.localize('InvMapMsg'));
            return;
        }

        //let allIds = [];
        //this.dragDropGrid._gridApi.forEachNode(node => allIds.push(node.data.id));
        let issameGrid = event.node.groupData;
        let newParentPath = [];
        let folderToDropInto = {};

        await this.updateSourceDataOnRowDragEnd(event, overNode, newParentPath, folderToDropInto);
        if (issameGrid) {
            // the data we want to move
            let movingData = event.node.data;

            let needToChangeParent = !this.arePathsEqual(newParentPath, movingData.filePath);

            // check we are not moving a folder into a child folder
            let invalidMode = this.isSelectionParentOfTarget(event.node, folderToDropInto);
            if (invalidMode) {
                LoggerManager.info('invalid move');
            }

            if (needToChangeParent && !invalidMode) {
                let updatedRows = [];
                this.moveToPath(newParentPath, event.node, updatedRows, issameGrid);

                this.dragDropGrid._gridApi.applyTransaction({
                    update: updatedRows
                });
                let updatedNode;
                let hierarchyIds = updatedRows.map(item => item?.hierarchyId);
                this.dragDropGrid._gridApi.forEachNode(node => {
                    if (hierarchyIds.includes(node.data.hierarchyId)) {
                        updatedNode = node;
                        if (!node.data.changedDragInfo) {
                            node.data.changedDragInfo = {};
                        }

                        if (!node.data.changedDragInfo[node?.data?.hierarchyId]) {
                            node.data.changedDragInfo[node?.data?.hierarchyId] = {};
                        }
                        node.data.changedDragInfo[node?.data?.hierarchyId].dragged = true;
                    }
                });
                this.dragDropGrid._gridApi.redrawRows({
                    force: true,
                    node: [updatedNode]
                });
                //updatedNode.parent.setExpanded(false);
                //updatedNode.parent.setExpanded(true);
                //this.dragDropGrid._gridApi.collapseRow(updatedNode.parent);
                //gridOptions.api.expandRow(_updatedNode.parent);
            }
        } else {
            let updatedRows = [];
            this.moveToPath(newParentPath, event.node, updatedRows, issameGrid);
            this.updateTargetGridOnRowDragEnd(updatedRows, this.dragDropGrid);
        }
    };

    /**
     * Function to update the target related data in source data(event.node) on drag/move.
     *
     */
    async updateSourceDataOnRowDragEnd(event, overNode, newParentPath, folderToDropInto) {
        // Don't allow the user to dnd without selecting a relationship in biz domain
        if (!this._selectedDomain.hasClassifications && ObjectUtils.isEmpty(this._selectedRelationship)) {
            ToastManager.showWarningToast('SelRelMapTxt');
            return;
        }
        this.allowOneToOneMapping = true;
        if(this.allowOneToOneMapping){
            // Get all MRs and check if MR already exists
            // Check if the source is mapped to any target entity in same context and relationship
            // Check if the source exists in temporary MR array 
            const isSourceMapped = await this._isSourceMapped(event.node.data, overNode.data)
            if(isSourceMapped){
                ToastManager.showWarningToast("Source entity already mapped to a target");
               return; 
            }
        }

        // folder to drop into is where we are going to move the file/folder to
        Object.assign(folderToDropInto, overNode);

        if (folderToDropInto.data) {
            Object.assign(newParentPath, folderToDropInto.data.filePath);
        }
        event.node.data.isMapped = true;
        if (this._selectedDomain?.hasClassifications) {
            //if type is present mean real data , else its path generated dummy data
            if (overNode.data.identifier != undefined && overNode.data.name != undefined) {
                event.node.data['droppedToId'] = overNode.data.identifier;
                event.node.data['droppedToExternalName'] = overNode.data.name;
                event.node.data['droppedToPath'] = overNode.data.filePathInString;
            } else {
                let name = newParentPath[newParentPath.length - 1];
                event.node.data['droppedToExternalName'] = name;
                let classification = await this.getClassificationByName(name);
                if (!ObjectUtils.isEmpty(classification)) {
                    event.node.data['droppedToId'] = classification.id;
                    event.node.data['droppedToPath'] = AttributeUtils.getFirstAttributeValue(
                        classification.data.attributes.externalnamepath
                    );
                }
            }
            //To get path of source classiication which is dragged to some target
            if (
                ObjectUtils.isValidObjectPath(event, 'node.data.externalnamepath') == false ||
                ObjectUtils.isValidObjectPath(event, 'node.data.externalName') == false
            ) {
                let classification = await this.getClassificationOrEntityById(event.node.data.id);
                if (!ObjectUtils.isEmpty(classification)) {
                    event.node.data['externalnamepath'] = classification.name;
                    event.node.data['externalName'] = classification.name;
                }
            }
            event.node.data['droppedToRel'] = this.mappedRelName;
            event.node.data['droppedToType'] = this._selectedDomain?.manageModelName;
        } else {
            //for other domain we do not have identifier we recognise with id only.
            event.node.data['droppedToId'] = overNode.data.id;
            event.node.data['droppedToExternalName'] = overNode.data.name;
            event.node.data['droppedToPath'] = overNode.data.filePathInString;
            event.node.data['droppedToRel'] = this._selectedRelationship?.relationshipName;

            const classification = await this.getClassificationOrEntityById(event.node.data.id);
            if (!ObjectUtils.isEmpty(classification)) {
                if (!ObjectUtils.isValidObjectPath(event, 'node.data.externalnamepath')) {
                    event.node.data['externalnamepath'] = classification.id;
                }

                if (!ObjectUtils.isValidObjectPath(event, 'node.data.externalName')) {
                    event.node.data['externalName'] = classification.name;
                }
            }
        }

        this._temporaryMappingRequests.push(event.node.data.id);

        //Add the status info
        event.node.data.action = 'link';
        event.node.data.isMapped = true;
    }

    /**
     * Function to update the target grid once the source node has been mapped to a target node
     *
     */
    updateTargetGridOnRowDragEnd(updatedRows, dragDropGrid) {
        dragDropGrid._gridApi.applyTransaction({
            add: updatedRows
        });
        let updatedNode;
        let hierarchyIds = updatedRows.map(item => item?.hierarchyId);
        dragDropGrid._gridApi.forEachNode(node => {
            if (hierarchyIds.includes(node?.data?.hierarchyId)) {
                updatedNode = node;
                if (!node.data.changedDragInfo) {
                    node.data.changedDragInfo = {};
                }

                if (!node.data.changedDragInfo[node?.data?.hierarchyId]) {
                    node.data.changedDragInfo[node?.data?.hierarchyId] = {};
                }
                node.data.changedDragInfo[node?.data?.hierarchyId].dragged = true;
            }
        });
        dragDropGrid._gridApi.redrawRows({
            force: true,
            rowNodes: [updatedNode]
        });
    }

    async _isSourceMapped(sourceNode, targetNode){
        const sourceId = sourceNode?.id;
        const sourceType = sourceNode?.type;
        const targetType = targetNode?.entityType;
        const relationship = this.getSelectedRelationship()?.relationshipName;
        let contextInfo = this.getSelectedContext();
        contextInfo = contextInfo && RelMappingHelper.createContextObj(contextInfo);
        
        const sourceExistsInTempArray = this._temporaryMappingRequests.includes(sourceId);        
        const mappingRequestExists = !sourceExistsInTempArray && await RelMappingHelper.mappingRequestExists(sourceId, relationship, contextInfo);
        const isSourceMappedToTarget = !mappingRequestExists && await RelMappingHelper.isSourceMappedToTarget(sourceId, sourceType, targetType, relationship, contextInfo);

        return isSourceMappedToTarget || mappingRequestExists || sourceExistsInTempArray;
    }

    /*
        This method is used to get any source entity or a classification using its id
    */
    async getClassificationOrEntityById(id) {
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        // If the source Domain hasClassifications, then use the manageModelName as the type.
        if (this._userSelectedSourceDomain.hasClassifications) {
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [
                { type: this._userSelectedSourceDomain.manageModelName, attributeNames: '_ALL' }
            ];
        } else {
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [
                { type: this._userSelectedSource.id, attributeNames: '_ALL' }
            ];
        }
        let request = DataRequestHelper.createEntityGetRequest(clonedContextData, true);
        request.params.query.id = id;

        let getRequest = DataObjectManager.createRequest('searchandget', request, '', {});
        let getResponse = await DataObjectManager.initiateRequest(getRequest);
        if (getResponse && getResponse.response && getResponse.response.status == 'success') {
            let entity = getResponse.response?.content?.entities[0];
            return entity;
        }
        return {};
    }
    async getClassificationByName(name) {
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [
            { type: this._selectedDomain?.manageModelName, attributeNames: '_ALL' }
        ];
        let request = DataRequestHelper.createEntityGetRequest(clonedContextData, true);
        request.params.query.name = name;
        let _attributesCriterionObj = {};
        _attributesCriterionObj[this.classificationAttributeName] = {
            exact: this._selectedSource.id,
            type: '_STRING'
        };
        request.params.query.filters.attributesCriterion = [_attributesCriterionObj];

        let getRequest = DataObjectManager.createRequest('searchandget', request, '', {});
        let getResponse = await DataObjectManager.initiateRequest(getRequest);
        if (getResponse && getResponse.response && getResponse.response.status == 'success') {
            let entity = getResponse.response?.content?.entities[0];
            return entity;
        }
        return {};
    }
    moveToPath(newParentPath, node, allUpdatedNodes, issameGrid) {
        let oldPath = '';
        let fileName = '';
        if (node.data.filePath) {
            oldPath = node.data.filePath;
            fileName = oldPath[oldPath.length - 1];
        } else {
            //Not changing case of this as its internal attribute coming in on classification entity itself
            oldPath = node.data['externalnamepath']?.split('>>');
        }
        //fileName = oldPath[oldPath.length - 1];
        let data = ObjectUtils.cloneObject(node.data);
        //let data = node.data;
        let newChildPath = newParentPath.slice();
        newChildPath.push(fileName || data['name']);
        data.filePath = newChildPath;
        node.data = data;
        if (issameGrid) {
            node.data.hierarchyId = node.data.hierarchyId = node.id;
        } else {
            node.data.hierarchyId = node.data.hierarchyId = UniqueIdUtils.getRandomId();
        }
        allUpdatedNodes.push(node.data);
        if (node.childrenAfterGroup) {
            node.childrenAfterGroup.forEach(childNode => {
                this.moveToPath(newChildPath, childNode, allUpdatedNodes, issameGrid);
            });
        }
    }
    isSelectionParentOfTarget(selectedNode, targetNode) {
        let children = [...(selectedNode.childrenAfterGroup || [])];

        if (!targetNode) {
            return false;
        }

        while (children.length) {
            const node = children.shift();
            if (!node) {
                continue;
            }

            if (node.key === targetNode.key) {
                return true;
            }

            if (node.childrenAfterGroup && node.childrenAfterGroup.length) {
                children.push(...node.childrenAfterGroup);
            }
        }

        return false;
    }
    arePathsEqual(path1, path2) {
        if (path1.length !== path2.length) {
            return false;
        }

        let equal = true;
        path1.forEach(function (item, index) {
            if (path2[index] !== item) {
                equal = false;
            }
        });

        return equal;
    }
    getGridAPi() {
        if (this.dragDropGrid && this.dragDropGrid._gridApi) {
            return this.dragDropGrid._gridApi;
        }
    }
    isFolderExistinPath(previousFilePathStrings, filePath) {
        let isFolderExist = false;
        previousFilePathStrings.forEach(currentItem => {
            //LoggerManager.info(currentItem);
            if (currentItem?.includes(filePath)) {
                isFolderExist = true;
            }
        });
        return isFolderExist;
    }
    createHierarchicalData(inputPath, previousFilePathStrings) {
        const inputData = [];
        const pathParts = inputPath.split('>>').map(part => part.trim());
        let filePath = [];
        let filePathString = '';
        pathParts.forEach((part, index) => {
            if (index > 0) {
                filePathString += '>>';
            }
            filePathString += part;
            filePath.push(part);
            const type = index === pathParts.length - 1 ? 'file' : 'folder';
            let isFolderExist = this.isFolderExistinPath(previousFilePathStrings, filePathString);
            if (type == 'folder' && !isFolderExist) {
                inputData.push({
                    id: UniqueIdUtils.getRandomId(),
                    filePath: [...filePath],
                    filePathInString: filePathString,
                    type
                });
            }
        });
        return inputData;
    }

    /**
     * Function to handle filter change event for lazy loaded source grid
     */
    _onSourceGridFilterChange(detail) {
        //Ignore unrelated events
        if (detail && detail.scopeId && detail.scopeId != this.scopeId) return;

        let filterCriterion = {};
        if (this.configType == 'source' && detail && this._entityDataGetReq && !ObjectUtils.isEmpty(this._dataSource)) {
            for (let key in detail) {
                let filter = {};
                filter[key] = {
                    contains: detail[key].filter + '*',
                    type: '_STRING'
                };
                filterCriterion = { ...filterCriterion, ...filter };
            }

            let request = ObjectUtils.cloneObject(this._entityDataGetReq);
            if (!ObjectUtils.isEmpty(filterCriterion)) {
                if (!request.params.query.filters.attributesCriterion) {
                    request.params.query.filters.attributesCriterion = [];
                }
                request.params.query.filters.attributesCriterion.push(filterCriterion);
            }
            this._dataSource.request = request;
        }
    }

    /**
     *   Function to remove the changedDragInfo
     */
    onRemoveTargetGridChangedInfo() {
        if (this.dragDropGrid && this.dragDropGrid._gridApi) {
            let rowModel = this.dragDropGrid._gridApi.getModel();
            let rootNode = rowModel.getRootNode();
            rootNode.allLeafChildren.forEach(function (node) {
                if (node.data && node.data.changedDragInfo) {
                    delete node.data.changedDragInfo;
                }
            });
        }
    }

    /**
     *   Function to show the blinker
     */
    showNotificationBlinker() {
        let refreshButton = this.targetToolbarRefreshIcon;
        if (refreshButton) {
            refreshButton.title = this.localize('RfsBtnTit');

            let refreshSvg;
            let paperButton = refreshButton.shadowRoot.querySelector('paper-button');
            if (paperButton) {
                refreshSvg = paperButton.querySelector('pebble-icon')
                    ? paperButton.querySelector('pebble-icon').shadowRoot.querySelector('svg')
                    : undefined;
            }

            if (refreshSvg) {
                let intervalCount = 0;
                refreshSvg.style.fill = '';
                clearInterval(this._refreshBlinkInterval);

                this._refreshBlinkInterval = setInterval(() => {
                    if (intervalCount == 6) {
                        clearInterval(this._refreshBlinkInterval);
                    }

                    if (!ObjectUtils.isEmpty(refreshSvg.style.fill)) {
                        refreshSvg.style.fill = '';
                    } else {
                        refreshSvg.style.fill = 'darkred';
                    }

                    intervalCount++;
                }, 1000);
            }
        }
    }

    /**
     *   Function to clear the blinker
     */
    _clearNotificationBlinker() {
        clearInterval(this._refreshBlinkInterval);
        let refreshButton = this.targetToolbarRefreshIcon;
        if (refreshButton) {
            refreshButton.title = this.localize('RfsTxt');
            let refreshSvg;
            let paperButton = refreshButton.shadowRoot.querySelector('paper-button');

            if (paperButton) {
                refreshSvg = paperButton.querySelector('pebble-icon')
                    ? paperButton.querySelector('pebble-icon').shadowRoot.querySelector('svg')
                    : undefined;
            }

            if (refreshSvg) {
                refreshSvg.style.fill = '';
            }
        }
    }

    /**
     * Function to handle unlink/delete action icon click
     */
    _onDeleteMappingButtonClick(e, params) {
        //If the node is recently added, then just remove the item from the grid
        if (!ObjectUtils.isEmpty(params.data.action) && params.data.action == 'link') {
            this.dragDropGrid.deleteRows([params.data]);
            this._temporaryMappingRequests = this._temporaryMappingRequests.filter(id => id !== params.data.id);
        } else {
            //Add the status info
            params.data.action = 'unlink';
            if (!params.data.changedDragInfo) {
                params.data.changedDragInfo = {};
            }
            if (!params.data.changedDragInfo[params?.data?.id]) {
                params.data.changedDragInfo[params?.data?.id] = {};
            }
            params.data.changedDragInfo[params?.data?.id].delete = true;
            this.reloadStatusColumn(params);
        }
    }

    /**
     * Function to relaod status column
     */
    reloadStatusColumn(params) {
        let columns = params.columnApi.getAllDisplayedColumns();
        let statusColumn = columns ? columns.find(v => v.colDef.field == 'relmap_grid_row_status') : undefined;
        params.api.refreshCells({
            force: true,
            columns: [statusColumn],
            rowNodes: [params.node]
        });
    }

    /**
     * Function of target grid to update the user selected source
     */
    updateUserSelectedSource(source) {
        this._userSelectedSource = source;
        // When the source domain is changed, we need to update the relationship types in the relationship dropdown
        if (!this._selectedDomain.hasClassifications) {
            this._prepareRelationshipTypes();
        }
    }

    /**
     * Function of target grid to update the user selected domain in source grid
     */
    updateUserSelectedDomain(domainDetails) {
        this._userSelectedSourceDomain = domainDetails;
    }
}

customElements.define('rock-drag-drop-grid', RockDragDropGrid);
