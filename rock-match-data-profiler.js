import { LitElement, html } from 'lit';

import 'ui-platform-elements/lib/elements/pebble-dropdown/pebble-dropdown.js';
import 'ui-platform-elements/lib/elements/pebble-content/pebble-content.element.js';
import 'ui-platform-elements/lib/elements/bedrock-grid/bedrock-grid.js';
import 'ui-platform-elements/lib/elements/bedrock-lov/bedrock-lov.js';

import { getCustomStylesForLit } from 'ui-platform-elements/lib/utils/getCustomStylesForLit';
import { styles as sharedStyles } from 'ui-platform-elements/lib/flow/core/base/shared.element.css.js';

import 'ui-platform-elements/lib/elements/bedrock-pubsub/bedrock-pubsub.js';
import 'ui-platform-elements/lib/styles/bedrock-style-common.js';
import 'ui-platform-elements/lib/styles/bedrock-style-buttons.js';
import 'ui-platform-business-elements/lib/elements/rock-search-query-parser/rock-search-query-parser.js';
import 'ui-platform-business-elements/lib/elements/rock-entity-upload/rock-entity-upload.js';

import { RufElement } from 'ui-platform-elements/lib/base/ruf-element.js';
import ComponentConfigBase from 'ui-platform-business-elements/lib/base/component-config-base.js';

import { MixinManager } from 'ui-platform-elements/lib/managers/mixin-manager.js';
import { LoggerManager } from 'ui-platform-elements/lib/managers/logger-manager.js';

import { ObjectUtils } from 'ui-platform-utils/lib/common/ObjectUtils.js';
import DataHelper from 'ui-platform-business-elements/lib/helpers/DataHelper.js';
import { DataObjectManager } from 'ui-platform-dataaccess/lib/managers/DataObjectManager.js';
import DataRequestHelper from 'ui-platform-business-elements/lib/helpers/DataRequestHelper.js';




class RockMatchDataProfiler extends MixinManager(LitElement).with(RufElement, ComponentConfigBase) {

    static get styles() {
        const customStyles = getCustomStylesForLit(['bedrock-style-padding-margin', 'bedrock-style-buttons']);
        return [...customStyles, sharedStyles];
    }

    static get properties() {
        return {
            contextData: {
                type: Object,
                reflect: true
            },
            headerFields: {
                type: Array
            },
            actions: {
                type: Object
            },
            uploadMode: {
                type: String
            },
            config: {
                type: Object
            },
            allowedFileTypes: {
                type: Array
            },
            selectedFileType: {
                type: String
            },
            _domains: {type: Array},
            _selectedDomain: { type: Object },
            supportedDomains: { type: Array },
            _scopes: {type: Array},
            _selectedScope: { type: Object },
            _entityTypes: {type: Array},
            _selectedEntityType: {type: Object},
            _attributes: {type: Array},
            _selectedAttributes: {type: Object}
        };
    }

    constructor() {
        super();
        this.contextData = {};
        this.headerFields = [];
        this.uploadMode = '';
        this.config = {};

        this.allowedFileTypes = [];
        this.selectedFileType = '';
        this.supportedDomains = [];
        this._domains = [];
        this._selectedDomain = {};
        this._scopes = [];
        this._selectedScope = {};
        this._entityTypes = [];
        this._selectedEntityType = {};
        this._attributes = [];
        this._selectedAttributes = [];

        this.actions = {
            'manage-mapping-loaded': {
                name: 'manage-mapping-loaded'
            },
            'on-search-filters': {
                name: 'on-search-filters'
            }
        }
        this._onReset();
    }

    render() {
        return html`
            <div>
                <div flow-layout="horizontal gap:md align:space-between m-y:md">
                    <pebble-dropdown
                        id="input"
                        input-control=""
                        class=""
                        flow-layout="horizontal align:start"
                        .label="${this.localize('ForTxt')}"
                        no-label-float="true"
                        .items=${this.allowedFileTypes}
                        @change=${this._onSelectedFileTypeChange}
                        .selectedValue=${this.selectedFileType}
                    >
                    </pebble-dropdown>
                    <div>
                    ${this.selectedFileType === 'importSavedSearch' ? 
                        html`
                        <div flow-layout="gap:md">
                        <pebble-button
                            id="loadMdpDataButton"
                            class="btn btn-success"
                            button-text="${this.localize('LodDatTxt')}"
                            noink=""
                            elevation="2"
                            .disabled=${this._disabledLoadButton}
                            @tap=${this._onLoadData}>
                        </pebble-button>
                        <pebble-button
                            id="resetButton"
                            class="btn btn-secondary"
                            button-text="${this.localize('RstLbl')}"
                            noink=""
                            elevation="2"
                            @tap=${this._onReset}>
                        </pebble-button>
                        </div>
                        ` : html``
                        }
                    </div>
                </div>

                <div>
                    ${this.selectedFileType === 'importExcel' || this.selectedFileType === 'importCSV' ? 
                    html`
                        <rock-entity-upload 
                            .contextData=${this.contextData}
                            .uploadMode=${this.uploadMode}
                            .allowTemplateDownload=${false}
                        ></rock-entity-upload>
                    `: 
                    html`
                    <div flow-layout="grid cols:4 gap:lg m-y:lg">

                        <!-- Domain Dropdown -->

                        <div id="domain-block">
                            <bedrock-lov
                                id="domain"
                                .items="${this._domains}"
                                .filterEnabled="${true}"
                                .selectedItem=${this._selectedDomain}
                                .selectedValue=${this._selectedDomain &&
                                this._selectedDomain.id}
                                @selection-changed=${this._onSelectedDomainChanged}
                                .noLabelFloat="${true}"
                                .noSubTitle="${false}"
                                .showActionButtons="${false}"
                                .selectAll="${true}"
                                .label=${this.localize('DomTxt')}
                            >
                            </bedrock-lov>
                        </div>
                        
                        <!-- Scope Dropdown -->
                      
                        <div id="scope-block" >
                            <bedrock-lov
                                id="scope"
                                .items="${this._scopes}"
                                .filterEnabled="${true}"
                                .selectedItem=${this._selectedScope}
                                .selectedValue=${this._selectedScope && this._selectedScope.id}
                                @selection-changed=${this._onSelectedScopeChanged}
                                @tag-removed=${this._onTagRemoved}
                                .noLabelFloat="${true}"
                                .noSubTitle="${false}"
                                .showActionButtons="${false}"
                                .label=${this.localize('ScoTxt')}
                            >
                            </bedrock-lov>
                        </div>
                    </div>

                    <div flow-layout="grid cols:4 gap:lg m-y:lg">

                      <!-- Entity Dropdown -->

                    <div id="entity-type-block" >
                        <bedrock-lov
                            id="entityType"
                            .items="${this._entityTypes}"
                            .multiSelect="${true}"
                            .filterEnabled="${true}"
                            .selectedItems=${this._selectedEntityTypes}
                            .selectedValues=${this._selectedEntityTypes &&
                            this._selectedEntityTypes.map(v => v.id)}
                            @selection-changed=${this._onSelectedEntityChanged}
                            @tag-removed=${this._onTagRemoved}
                            .noLabelFloat="${true}"
                            .noSubTitle="${false}"
                            .showActionButtons="${false}"
                            .selectAll="${true}"
                            .label=${this.localize('ETTxt')}
                        >
                        </bedrock-lov>
                    </div>

                    <!-- Attribute Dropdown -->

                    <div id="attrs-block">
                        <bedrock-lov
                            id="rAttrs"
                            .items="${this._attributes}"
                            .multiSelect="${true}"
                            .filterEnabled="${true}"
                            .selectedItems=${this._selectedReportableAttrs}
                            .selectedValues=${this._selectedReportableAttrs &&
                            this._selectedReportableAttrs.map(v => v.id)}
                            @selection-changed=${this._onSelectedAttributesChanged}
                            @tag-removed=${this._onTagRemoved}
                            .noLabelFloat="${true}"
                            .noSubTitle="${false}"
                            .showActionButtons="${false}"
                            .selectAll="${true}"
                            .label=${this.localize('AttrTxt')}
                        >
                        </bedrock-lov>
                    </div>
                </div>
                          
                <rock-search-query-parser 
                    id="queryParser" 
                    .contextData=${this.contextData}>
                </rock-search-query-parser>
                    `} 
                </div>
            </div> 
        `;
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
            this.requestConfig('rock-match-data-profiler', this.contextData);
        }
    }

    onConfigLoaded(componentConfig) {
        if (componentConfig && ObjectUtils.isValidObjectPath(componentConfig,'config.properties')) {
            this.config = componentConfig.config.properties;
        }
    }

    actionCallback(actionName, detail) {
        switch (actionName) {
            case 'manage-mapping-loaded': {
                if (!ObjectUtils.isEmpty(detail)) {
                    this.headerFields = detail.attributeMappingData.headerFields.customsheet;
                    console.log(this.headerFields);
                }
                break;
            }
            case 'on-search-filters': {
                if (!ObjectUtils.isEmpty(detail)) {
                    this._entityTypes = detail.entityTypesForSearch;
                    this._getEntityTypes();
                }
                break;
            }
            default:
                break;
        }
    }

    _onSelectedFileTypeChange(e){
        if (e && e.detail) {
            this.selectedFileType = e.detail.newValue;
        }
        if(this.selectedFileType == 'importSavedSearch'){
            this._getAllDomains();
        }    
    }

    _onSelectedDomainChanged(e){
        if(e && e.detail){
            this._selectedDomain = e.detail.selectedItem;
            this._getScopes([this._selectedDomain.value]);
        }
    }

    _onSelectedScopeChanged(e){
        if(e && e.detail){
            this._selectedScope = e.detail.selectedItem;
            const query = this._selectedScope.id.internalQuery;
            this._parseQuery(query);
        }
    }

    _onSelectedEntityChanged(e){
        if(e && e.detail)
        this._getAttributes(e.detail.selectedItem.id);
    }

    _onSelectedAttributesChanged(e){
        if(e && e.detail)
            this._selectedAttributes.push(e.detail.selectedItem);
    }

    _onLoadData(){
        this.headerFields = [];
        this._selectedAttributes.forEach(attribute => {
            this.headerFields.push(attribute.id);
        })

        this.dataFunctionComplete(this.headerFields, [], false, true)
    }

    async _getAttributes(entityId){
        let requestData = DataRequestHelper.createGetManageModelRequest([entityId]);
        let getResponse = await DataObjectManager.rest('/data/pass-through/entitymodelservice/get', requestData);

        if(ObjectUtils.isValidObjectPath(getResponse, "response.entityModels.0.data.attributes")){
            let attributes = getResponse.response.entityModels[0].data.attributes;
            for(const [key, value] of Object.entries(attributes)){
                this._attributes.push({
                    id: key,
                    title: key,
                    value: key
                })
            }
        }
    }

    _onReset() {
        this._selectedDomain = [];

        this._entityTypes = [];
        this._selectedEntityType = {};

        this._scopes = [];
        this._selectedScope = {};

        this._attributes = [];
        this._selectedAttributes = [];
    }

    _parseQuery(query) {
        let queryParser = this.shadowRoot.querySelector('[id=queryParser]');
        if (queryParser) {
            queryParser.parseQueryToFilters(query);
        }
    }

    async _getEntityTypes(){
        let formattedEntityTypes = [];
        this._entityTypes.forEach(entity => {
            formattedEntityTypes.push({
                id: entity,
                title: entity,
                value: entity,
            })
        })

        this._entityTypes = formattedEntityTypes;
    }

    /** Creates and initiates request to fetch - Domains */    
    async _getAllDomains(){
        const {response} = await DataHelper.getDomains();
        if(response.status === "success"){
            this._domains = this._formatForLov(response, this.supportedDomains)
        }
    }

    async _getScopes(domain){
        const context = ObjectUtils.cloneObject(this.contextData);
            const response = await DataHelper.getScopes(domain, context);
            const isSuccess = response && response.response && response.response.status == 'success';
            let savedSearches = [];
            if (isSuccess && Array.isArray(response.response.configObjects)) {
                const configObjects = response.response.configObjects;
                configObjects.forEach(configObject => {
                    const isValid = ObjectUtils.isValidObjectPath(configObject, 'data.contexts.0.jsonData.config');
                    if (isValid) {
                        const config = configObject.data.contexts[0].jsonData.config;
                        savedSearches.push({
                            title: config.name,
                            id: config,
                            value: config.name
                        });
                    }
                });
                savedSearches = _.sortBy(savedSearches, item => item.title.toLowerCase());
            } else {
                LoggerManager.logError(this, 'Saved search get exception', response);
            }
            this._scopes = savedSearches;
    }

    _formatForLov(response, supportedDomains) {
        let domains = [];
        if (response && supportedDomains && response.entityModels) {
            const rawList = response.entityModels;
            if (Array.isArray(rawList)) {
                rawList.forEach(domain => {
                    /** Ignore domains that arent supported */
                    if (supportedDomains.indexOf(domain.name) > -1) {
                        const id = domain.id;
                        const title = domain.properties ? domain.properties.externalName : domain.name;
                        const value = title;
                        domains.push({
                            title,
                            id,
                            value
                        });
                    }
                });
                domains = _.sortBy(domains, item => item.title.toLowerCase());
            }
        }
        return domains;
    }

}
customElements.define('rock-match-data-profiler', RockMatchDataProfiler);
