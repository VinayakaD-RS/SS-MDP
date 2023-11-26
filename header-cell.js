import { LitElement, html } from 'lit';
import 'ui-platform-elements/lib/elements/pebble-checkbox/pebble-checkbox.js';

import 'ui-platform-elements/lib/elements/pebble-icon/pebble-icon.js';
import 'ui-platform-elements/lib/elements/pebble-toggle-button/pebble-toggle-button.js';
import 'ui-platform-elements/lib/styles/bedrock-style-common.js';
import { AppInstanceManager } from 'ui-platform-elements/lib/managers/app-instance-manager';
import { ObjectUtils } from 'ui-platform-utils/lib/common/ObjectUtils';
import { LocalizationManager } from 'ui-platform-elements/lib/managers/localization-manager.js';
import { ThemeManager } from 'ui-platform-elements/lib/managers/theme-manager';

import { PubSubManager } from 'ui-platform-elements/lib/managers/pubsub-manager.js';
import { AttributeUtils } from 'ui-platform-utils/lib/mdm/AttributeUtils';
import { getCustomStylesForLit } from 'ui-platform-elements/lib/utils/getCustomStylesForLit';
import { styles } from './header-cell.element.css.js';

export default class HeaderCell extends LitElement {

    static get styles() {
        const customStyles = getCustomStylesForLit([
            'bedrock-style-common'
        ]);
        return [...customStyles, styles];
    }

    render() {
        return html`        
            <div class="header-cell-container">
                <div class="actions-placeholder">
                    ${this.isRepresentative ? html`
                        <div class="action-container">
                            <div class="representative" title="Representative">
                                <pebble-icon icon="pebble-icon:mark-representative"></pebble-icon>
                            </div>
                        </div>
                    `: html``}
                    ${this.showActions ? html`
                        <div class="action-container">
                            ${this.actions.map(item => html`
                                <pebble-icon
                                    class="cursor-pointer"
                                    title=${item.label}
                                    icon=${item.icon}
                                    .iconText=${item.iconText}
                                    .action=${item.action}
                                    .disabled=${this._disableActions}
                                    .hidden=${this._hideAction(this._disableActions, item.hideOnDisable)}
                                    @tap=${this._onActionTap}
                                ></pebble-icon>
                            `)}
                        </div>
                    `: html``}
                </div>
                <div class="title-container ${this._setEmptyActionsSpace()}">
                    ${this.showCheckbox ? html`
                        <pebble-checkbox
                            .disabled=${this.isCheckboxDisabled}
                            .checked$=${this.inputChecked}
                            @change=${this._inputCheckedChange}
                        ></pebble-checkbox>
                    `: html``}
                    <div class="${this._getWrapperClass(this.isRepresentative)}">
                        ${this._isHeaderLinkAvailable(this.columnLink) ? html`
                            <div
                                class="cursor-pointer column-name text-ellipsis"
                                @tap=${this._columnLinkClicked}
                                title=${this.columnName}
                            >
                                <pebble-icon class="type-icon pebble-icon-size-16" icon=${this._typeIcon}></pebble-icon>
                                ${this.columnName}
                            </div>
                            `: html``}
                        ${this._isHeaderLinkAvailable(this.columnLink) ? html`
                            <div class="column-name text-ellipsis" title=${this.columnName}>${this.columnName}</div>
                        `: html``}
                        ${this.headerSubTitle ? html`
                            <div class="sub-title">
                                <div class="${this._getClassForSubTitleHeader(this._allowMergePreview)}">
                                    ${this._showMergePreviewTogglethis(this.params) ? html`
                                        <div class="toggle">
                                            <pebble-toggle-button
                                                class="m-b-10"
                                                .checked=${this._allowMergePreview}
                                                title=${this.headerSubTitle}
                                                @tap=${this._onToggleChange}
                                            ></pebble-toggle-button>
                                        </div>
                                    ` : html``}
                                    <div class="sub-title-header text-ellipsis" title=${this.headerSubTitle}>
                                        ${this.headerSubTitle}
                                    </div>
                                </div>
                                ${this._showStrategyToggle(this._allowMergePreview, this._isRelationship, this.params) ? html`
                                    <div class="sub-title-header-wrapper">
                                        <div class="toggle-strategy">
                                            <pebble-toggle-button
                                                class="m-b-10"
                                                .checked=${this._showStrategyColumn}
                                                title=${this.localize('VieStrTxt')}
                                                @tap=${this._hideShowStrategyColumn}
                                            ></pebble-toggle-button>
                                        </div>
                                        <div class="sub-title-header text-ellipsis" title=${this.localize('VieStrTxt')}>
                                            ${this.localize('VieStrTxt')}
                                        </div>
                                    </div>
                                ` : html``}
                            </div>
                        `: html``}
                        <div class="state-container-wrapper">
                            ${this._grmStates ? html`
                                <div
                                    class="state-container"
                                    ?hidden=${!this._grmStates.grmState}
                                    style=${this._getStateColor(this._grmStates.grmState, 'grmstate')}
                                    title=${this.localize('GolRecManStaTxt')}
                                >
                                    ${this._grmStates.grmState}
                                </div>
                                ${this._hasDifferentStates(this._grmStates) ? html`
                                    <div
                                        class="state-container"
                                        hidden=${!this._grmStates.grmProcessState}
                                        style=${this._getStateColor(this._grmStates.grmProcessState, 'grmprocessstate')}
                                        title=${this.localize('GolRecManProStaTxt')}
                                    >
                                        ${this._grmStates.grmProcessState}
                                    </div>
                                `: html``}
                            `: html``}
                            ${this._isSourceOfEntity ? html`
                                <div class="state-container state-blue">${this.localize('GolRecStaTit')}</div>
                            ` : html``}
                            ${this._isPotentialMatch(this._isSourceOfEntity, this._column) ? html`
                                ${!this._isWhereusedProcess(this._column) ? html`
                                    <div class="state-container state-blue">${this.localize('PotMatStaTit')}</div>
                                ` : html``}
                                <!--<template is="dom-if" if="[[_isWhereusedProcess(_column)]]">
                                    <div class="state-container state-blue">Whereused IsSourceOf</div>
                                </template>-->
                            ` : html``}
                        </div>
                        ${this._subHeaders ? html`
                            <div class="sub-header-wrapper">
                                ${this._subHeaders.map((subHeader) => html`
                                    <div class="sub-header ${subHeader.class}" title=${subHeader.title}>
                                        ${subHeader.value}
                                    </div>
                                `)}
                            </div>
                        ` : html``}
                    </div>
                </div>
            </div>
        `;
    }

    static get properties() {
        return {
            inputChecked: {
                type: Boolean
            },
            columnName: {
                type: String
            },
            headerSubTitle: {
                type: String
            },
            columnLink: {
                type: String
            },
            isRepresentative: {
                type: Boolean
            },
            showActions: {
                type: Boolean
            },
            actions: {
                type: Object
            },
            isCheckboxDisabled: {
                type: Boolean
            },
            showCheckbox: {
                type: Boolean
            },
            _disableActions: {
                type: Boolean
            },
            _isRelationship: {
                type: Boolean
            },
            _subHeaders: {
                type: Array
            },
            _allowMergePreview: {
                type: Boolean
            },
            _grmStates: {
                type: Object
            },
            _showStrategyColumn: {
                type: Boolean
            }
        };
    }

    constructor(){
        super();
        this.inputChecked = false;
        this.columnName = '';
        this.headerSubTitle = '';
        this.columnLink = '';
        this.isRepresentative = false;
        this.showActions = false;
        this.actions = {};
        this.isCheckboxDisabled = false;
        this.showCheckbox = false;
        this._disableActions = false;
        this._isRelationship = false;
        this._subHeaders = [];
        this._allowMergePreview = false;
        this._grmStates = {};
        this._showStrategyColumn = false;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }
    localize(...args) {
        return LocalizationManager.localize(...args);
    }

    agInit(params) {
        if (ObjectUtils.isEmpty(params) || ObjectUtils.isEmpty(params.column)) {
            return;
        }

        this.params = params;
        this.data = params.data;
        let column = this.params.column.colDef;
        this._column = column;
        this.columnName = column.columnName;
        this.columnLink = column.link;
        this.isRepresentative = column.isRepresentative;
        this._isSourceOfEntity = column.isSourceOfEntity;
        this.showActions = column.showActions;

        this.actions = column.actions;
        this._disableActions = column.disableHeaderCell;
        this._isRelationship = column.isRelationship;
        this.isCheckboxDisabled = column.isCheckboxDisabled;

        this.showCheckbox = column.showCheckbox ? column.showCheckbox : false;
        this.inputChecked = column.isChecked ? column.isChecked : false;
        if (column.type == 'rankingCell' || column.type == 'sourceCell') {
            this.inputChecked = column.isSelected;
        }

        this._typeIcon = column.typeIcon;
        this._grmStates = column.grmStates;
        //Header checkbox checked/disable as per isPreviewProcess and is only on first load
        this.inputChecked = column.allowMergePreview && !column.manualChecked ? false : this.inputChecked;
        this.isCheckboxDisabled = column.allowMergePreview && !column.manualChecked ? false : this.isCheckboxDisabled;

        if (column.type == 'goldenCell') {
            this.headerSubTitle = column.subHeader;
            this.setGoldenCellColumnName();
            this._setAllowMergePreview();
        } else {
            this._setSubHeaders(column.subHeader);
        }
    }

    _setAllowMergePreview() {
        let allowMergePreviewColumn = this.params.columnApi
            .getAllColumns()
            .find(col => col.colDef && col.colDef.allowMergePreview);
        this._allowMergePreview = !ObjectUtils.isEmpty(allowMergePreviewColumn);
    }

    _onToggleChange() {
        let eventName = 'allow-merge-preview-change';
        let eventDetail = {
            name: eventName,
            allowMergePreview: this._allowMergePreview
        };
        this._allowMergePreview = !this._allowMergePreview;
        PubSubManager.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
    }

    _setSubHeaders(colSubHeader) {
        let subHeaders = [];
        if (!ObjectUtils.isEmpty(colSubHeader)) {
            for (let key in colSubHeader) {
                if (key == 'percentage') {
                    let percentage = colSubHeader.percentage;
                    if (percentage) {
                        if (percentage.indexOf('.') >= 0) {
                            //Do not round off the percentage, show score upto 2 decimal places
                            let tempPercentage = parseFloat(percentage).toString();
                            percentage = tempPercentage.slice(0, tempPercentage.indexOf('.') + 3);
                            percentage = percentage + '%';
                        }
                        subHeaders.push({
                            class: key,
                            title: percentage,
                            value: percentage
                        });
                    }
                } else {
                    if (colSubHeader[key]) {
                        subHeaders.push({
                            class: key,
                            title: colSubHeader[key],
                            value: colSubHeader[key]
                        });
                    }
                }
            }
            this._subHeaders = subHeaders;
        }
    }

    setGoldenCellColumnName() {
        if (this._column.field == 'strategy') {
            return;
        }
        let columns = this.params.columnApi.getAllColumns();
        let column = columns.find(c => c.colDef.isDefaultSelected);
        let defSelectColumn = column ? column.colDef : {};

        if (ObjectUtils.isEmpty(defSelectColumn)) {
            let column;
            columns.forEach((col, index) => {
                column = col.colDef;
                if (col.colDef.isSelected) {
                    this.columnName = column.columnName;
                }
            });
        } else {
            this.columnName = defSelectColumn.columnName;
        }
    }

    _inputCheckedChange(e) {
        let checked = e.target.checked;
        this.params.column.colDef.manualChecked = checked;
        if (!checked) {
            let defaultSelectedColDef =
                this.params.columnApi.getAllColumns().find(c => c.colDef.isDefaultSelected).colDef || {};
            defaultSelectedColDef.manualChecked = true;
        }
        this.triggerInputCheckChange(checked, true);
    }

    triggerInputCheckChange(inputChecked, triggerEvent = false) {
        let checked = inputChecked;
        let column = this.params.column.colDef;
        let itemsToUpdate = [];
        let rowData = [];
        this.params.api.forEachNode(function (rowNode, index) {
            rowData.push(rowNode.data);
        });

        let pinnedRows = this.params.api.pinnedRowModel.getPinnedTopRowData() || [];
        pinnedRows = pinnedRows.map(rowNode => rowNode.data);

        itemsToUpdate = [...rowData, ...pinnedRows];
        let defaultSelectedColDef =
            this.params.columnApi.getAllColumns().find(c => c.colDef.isDefaultSelected).colDef || {};

        let selectedColumnId = defaultSelectedColDef.columnId;
        /* row update*/
        if (checked) {
            selectedColumnId = column.columnId;
        }

        itemsToUpdate.forEach((rowNode, index) => {
            if (!rowNode.goldenAttribute) {
                rowNode.goldenAttribute = {};
            }
            rowNode.selectedEntityId = defaultSelectedColDef.columnId;
            rowNode.selectedColId = rowNode.selectedColumnId =
                ObjectUtils.isEmpty(rowNode[selectedColumnId]) && selectedColumnId != defaultSelectedColDef.columnId
                    ? defaultSelectedColDef.columnId
                    : selectedColumnId;

            if (
                (rowNode.attributeModel && rowNode.attributeModel.hasWritePermission) ||
                (this._isRelationship &&
                    ObjectUtils.isValidObjectPath(rowNode, 'relationshipModel.properties.hasWritePermission') &&
                    rowNode.relationshipModel.properties.hasWritePermission)
            ) {
                rowNode.goldenAttribute.isValueChanged = false;
                rowNode.goldenAttribute.value = rowNode[rowNode.selectedColId];
                let valObj = this._getValueObject(rowNode, rowNode.selectedColId);
                rowNode.goldenAttribute.valueObject = valObj;
                rowNode.goldenAttribute.originalValueObject = ObjectUtils.cloneObject(valObj);

                if (this._isRelationship) {
                    let relDetails = {};
                    if (
                        ObjectUtils.isValidObjectPath(
                            rowNode,
                            `relationshipObject.relationshipDetails.${rowNode.selectedColId}`
                        )
                    ) {
                        relDetails = rowNode.relationshipObject.relationshipDetails[rowNode.selectedColId];
                    }
                    rowNode.goldenAttribute.relationshipDetails = relDetails;
                }
            }

            delete rowNode['isPreviewProcess']; //Needed only on initial load for preview entity (EnrichItem - Item flow)
            this._resetPreviewData(rowNode);
        });

        /* header cell update */
        let updatedcolumns = this.params.columnApi.getAllColumns();
        updatedcolumns.forEach((col, index) => {
            let updatedColumn = col.colDef;
            if (checked) {
                if (selectedColumnId == updatedColumn.columnId) {
                    updatedColumn.isSelected = true;
                } else {
                    updatedColumn.isSelected = false;
                }
            } else {
                if (defaultSelectedColDef.columnId == updatedColumn.columnId) {
                    updatedColumn.isSelected = true;
                } else {
                    updatedColumn.isSelected = false;
                }
            }
        });

        this.params.api.refreshHeader();
        this._resetFilters();
        this._setRowData(itemsToUpdate);

        if (triggerEvent) {
            this.params.action(selectedColumnId);
        }
    }

    _setRowData(itemsToUpdate) {
        this.params.api.setRowData(itemsToUpdate);
        //Redraw pinned rows
        let pinnedItems = itemsToUpdate.filter(item => item.isPinnedRow);
        this.params.api.redrawRows(pinnedItems);
    }

    _resetFilters() {
        this.params.api.valueFilter = '';
        this.params.api.setQuickFilter('');
    }

    _resetPreviewData(rowNode) {
        delete rowNode.previewObject;
        delete rowNode.previewValue;
        delete rowNode.previewRelationshipEntityData;
    }

    _getValueObject(rowNode, columnId) {
        let valObj = {};
        if (this._isRelationship) {
            if (rowNode.relationshipObject && rowNode.relationshipObject[columnId]) {
                valObj = rowNode.relationshipObject[columnId];
            }
        } else {
            if (rowNode.attributeObject && rowNode.attributeObject[columnId]) {
                valObj = rowNode.attributeObject[columnId];
            }
        }
        return valObj;
    }

    _onActionTap(e) {
        if (e.currentTarget) {
            let eventName = e.currentTarget.action;
            let eventDetail = {
                name: eventName,
                data: this.params.column.colDef
            };
            PubSubManager.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
        }
    }

    _columnLinkClicked(e) {
        if (!ObjectUtils.isEmpty(this.columnLink)) {
            let eventName = 'merge-column-link-click';
            let eventDetail = {
                name: eventName,
                data: this.params.column.colDef
            };
            PubSubManager.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
            AppInstanceManager.navigateFromLink(this.columnLink);
        }
    }

    _isHeaderLinkAvailable(link) {
        if (!ObjectUtils.isEmpty(link)) {
            return true;
        }
        return false;
    }

    enableDisableActions(disabled) {
        let actions = this.shadowRoot ? this.shadowRoot.querySelectorAll('pebble-icon') : undefined;

        if (actions) {
            if (disabled) {
                actions.forEach(v => v.setAttribute('disabled', 'disabled'));
            } else {
                actions.forEach(v => v.removeAttribute('disabled'));
            }
        }
    }

    _setEmptyActionsSpace() {
        if (!this.showActions && !this.isRepresentative) {
            return 'emtpy-actions-space';
        }
    }

    _hideAction(isDisable, isHideOnDisable) {
        return isDisable && isHideOnDisable;
    }

    _getWrapperClass() {
        if (this.isRepresentative) {
            return 'representative-wrapper';
        }
        return 'title-wrapper';
    }

    _showMergePreviewToggle() {
        let foundMergePreviewToggle = this.params.columnApi
            .getAllColumns()
            .find(col => col.colDef.showMergePreviewToggle);
        return !ObjectUtils.isEmpty(foundMergePreviewToggle);
    }

    _isPotentialMatch() {
        let columnTypes = ['attributeCell', 'sourceCell', 'goldenCell'];
        return !this._isSourceOfEntity && !columnTypes.includes(this._column.type);
    }

    _isWhereusedProcess() {
        let foundWhereused = this.params.columnApi.getAllColumns().find(col => col.colDef.isWhereusedProcess);
        return !ObjectUtils.isEmpty(foundWhereused);
    }

    _hasDifferentStates(grmStatesObj) {
        return grmStatesObj.grmState != grmStatesObj.grmProcessState;
    }

    _getStateColor(state, type) {
        let grmStateModels = {};
        if (this._column && this._column.grmStates && this._column.grmStates.models) {
            grmStateModels = this._column.grmStates.models;
        }
        let backgroundColor = AttributeUtils.getAttributeColorCode(state, grmStateModels[type] || {});
        let invertColor = ThemeManager.getInvertColor(backgroundColor);
        return `background-color: ${backgroundColor};color: ${invertColor}`;
    }

    resetStrategyColumn(showStrategyColumn) {
        this._showStrategyColumn = showStrategyColumn;
        this.params.columnApi.setColumnsVisible(['strategy'], showStrategyColumn);
        setTimeout(() => {
            this.params.api.sizeColumnsToFit();
        }, 0);
    }

    _hideShowStrategyColumn() {
        this.resetStrategyColumn(!this._showStrategyColumn);
        //TODO - Enable this when relationships also has strategy details
        // let eventName = 'on-strategy-show-or-hide';
        // let eventDetail = {
        //     name: eventName,
        //     showStrategyColumn: this._showStrategyColumn,
        //     isRelationshipGrid: this._isRelationship
        // };
        // PubSubManager.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
    }

    _showStrategyToggle() {
        //TODO - Remove relationship check when relationships also has strategy details
        let strategyColumn = this.params.columnApi
            .getAllColumns()
            .find(column => column.colDef && column.colDef.field == 'strategy' && column.colDef.type == 'goldenCell');
        return this._allowMergePreview && strategyColumn && !this._isRelationship;
    }

    _getClassForSubTitleHeader() {
        //If view strategy toggle is visible, then add the 'sub-title-header-wrapper'
        let showStrategyToggle = this._showStrategyToggle();
        if (showStrategyToggle) {
            return 'sub-title-header-wrapper';
        } else {
            return 'merge-preview-wrapper';
        }
    }
}

customElements.define(HeaderCell, "header-cell");
