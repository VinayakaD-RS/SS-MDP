// Hack to load the grid faster

import { LitElement, html } from 'lit';
import { Debouncer } from 'ui-platform-elements/lib/helpers/lit/utils/debounce.js';
import { timeOut } from 'ui-platform-elements/lib/helpers/lit/utils/async.js';
import { ContextUtils } from 'ui-platform-utils/lib/mdm/ContextUtils.js';
import 'ui-platform-elements/lib/elements/bedrock-pubsub/bedrock-pubsub.js';
import DataHelper from 'ui-platform-business-elements/lib/helpers/DataHelper.js';
import DataTransformHelper from 'ui-platform-business-elements/lib/helpers/DataTransformHelper.js';
import DataRequestHelper from 'ui-platform-business-elements/lib/helpers/DataRequestHelper.js';
import 'ui-platform-elements/lib/styles/bedrock-style-common.js';
import 'ui-platform-elements/lib/styles/bedrock-style-padding-margin.js';
import 'ui-platform-elements/lib/styles/bedrock-style-grid-layout.js';
import 'ui-platform-elements/lib/elements/pebble-dropdown/pebble-dropdown.js';
import 'ui-platform-elements/lib/elements/pebble-spinner/pebble-spinner.js';
import 'ui-platform-elements/lib/elements/pebble-accordion/pebble-accordion.js';
import 'ui-platform-elements/lib/elements/pebble-badge/pebble-badge.js';
import 'ui-platform-elements/lib/elements/pebble-popover/pebble-popover.js';
import 'ui-platform-elements/lib/styles/bedrock-vertical-divider.js';
import { SettingsManager } from 'ui-platform-elements/lib/managers/settings-manager.js';
import 'ui-platform-business-elements/lib/elements/rock-tabs/rock-tabs.js';
import 'ui-platform-elements/lib/elements/pebble-grid/pebble-grid.js';

import { DateTimeFormatUtils } from 'ui-platform-utils/lib/common/DateTimeFormatUtils';
import { EntityTypeManager } from 'ui-platform-dataaccess/lib/managers/EntityTypeManager.js';
import { DataObjectManager } from 'ui-platform-dataaccess/lib/managers/DataObjectManager.js';
import { EntityCompositeModelManager } from 'ui-platform-dataaccess/lib/managers/EntityCompositeModelManager.js';
import MessageHelper from 'ui-platform-business-elements/lib/helpers/MessageHelper.js';
import { MixinManager } from 'ui-platform-elements/lib/managers/mixin-manager.js';
import { RufElement } from 'ui-platform-elements/lib/base/ruf-element.js';
import ComponentConfigBase from 'ui-platform-business-elements/lib/base/component-config-base.js';
import { ComponentContextBase } from 'ui-platform-elements/lib/base/component-context-base.js';
import { LoggerManager } from 'ui-platform-elements/lib/managers/logger-manager.js';
import { ToastManager } from 'ui-platform-elements/lib/managers/toast-manager.js';
import { AppInstanceManager } from 'ui-platform-elements/lib/managers/app-instance-manager';
import { PubSubManager } from 'ui-platform-elements/lib/managers/pubsub-manager.js';
import { AttributeUtils } from 'ui-platform-utils/lib/mdm/AttributeUtils.js';
import { Constants } from 'ui-platform-utils/lib/mdm/Constants.js';
import { EntityUtils } from 'ui-platform-utils/lib/mdm/EntityUtils.js';
import NotificationHelper from 'ui-platform-business-elements/lib/helpers/NotificationHelper.js';
import { ObjectUtils } from 'ui-platform-utils/lib/common/ObjectUtils.js';
import { DALCommonUtils } from 'ui-platform-dataaccess/lib/utils/DALCommonUtils.js';
import { UniqueIdUtils } from 'ui-platform-utils/lib/common/UniqueIdUtils.js';
import { ArrayUtils } from 'ui-platform-utils/lib/common/ArrayUtils.js';

import { ConfigurationManager } from 'ui-platform-dataaccess/lib/managers/ConfigurationManager.js';
import { LocalizationManager } from 'ui-platform-elements/lib/managers/localization-manager.js';
import { OSElements } from 'ui-platform-elements/lib/base/os-elements.js';
import 'ui-platform-elements/lib/elements/pebble-checkbox/pebble-checkbox.js';
import { ReferenceManager } from 'ui-platform-dataaccess/lib/managers/ReferenceManager.js';
import { LocaleManager } from 'ui-platform-dataaccess/lib/managers/LocaleManager.js';

import 'ui-platform-business-elements/lib/elements/rock-message-grid/rock-message-grid.js';
import '../rock-merge-review-panel/rock-merge-review-panel.js';
import { AssetDataSourceProviderManager } from 'ui-platform-business-elements/lib/managers/AssetDataSourceProviderManager.js';
import { BinaryStreamObjectManager } from 'ui-platform-business-elements/lib/managers/BinaryStreamObjectManager.js';
import NavigationManager from 'ui-platform-business-elements/lib/managers/NavigationManager.js';
import { UOMFormatUtils } from 'ui-platform-business-elements/lib/helpers/UOMFormatUtils.js';
import { DialogManager } from 'ui-platform-elements/lib/managers/dialog-manager.js';
import LiquidResponseUtils from 'ui-platform-utils/lib/mdm/LiquidResponseUtils.js';
import { EntityOperationManager } from 'ui-platform-business-elements/lib/managers/EntityOperationManager';
import MatchMergeHelper from '../rock-match-merge/MatchMergeHelper';

import { styles as sharedStyles } from 'ui-platform-elements/lib/flow/core/base/shared.element.css.js';
import { getCustomStylesForLit } from 'ui-platform-elements/lib/utils/getCustomStylesForLit.js';
import { styles } from './rock-match-merge.element.css.js';

class RockMatchMerge extends MixinManager(LitElement).with(RufElement, ComponentConfigBase, ComponentContextBase) {
    render() {
        return html`
            <pebble-spinner .active=${this._loading}></pebble-spinner>
            ${this._isValidForProcess
                ? html`
                      <div class="base-grid-structure">
                          <div class="base-grid-structure-child-1">
                              <!-- Actions for match/merge review -->
                              <div
                                  class="tabs-right-placeholder ${this._getClassForMessageOnly(this._showMessageOnly)}"
                                  ?disabled=${this._loading}
                              >
                                  ${this._showPotentialMatchCheckbox(
                                      this.showPotentialMatch,
                                      this._showMessageOnly,
                                      this.showActionButtons
                                  )
                                      ? html`
                                            <pebble-checkbox
                                                class="potential-match-checkox"
                                                ?hidden=${!this._isOwnedProcess}
                                                ?disabled=${this._disablePotentialMatch(
                                                    this._loading,
                                                    this._isSourceOfRelationship
                                                )}
                                                ?checked=${this.selectPotentialMatches}
                                                @change=${this._onSelectPotentialMatchesFlagChange}
                                            >
                                                ${this.localize('ShoPotMatTxt')}
                                            </pebble-checkbox>
                                            <span ?hidden=${!this._isOwnedProcess} class="vertical-divider"></span>
                                        `
                                      : html``}
                                  ${this._showNextContainer(this.isBulkProcess, this.isCompareProcess)
                                      ? html`
                                            <pebble-badge
                                                title="${this.localize('ShoTxt')} ${this.localize('SumTit')}"
                                                class="summary-badge"
                                                label=${this._reviewStatus}
                                                id="summary-list"
                                                label="0"
                                                @click=${this.showSummaryList}
                                            ></pebble-badge>
                                            <pebble-button
                                                class="next-button action-button btn btn-secondary m-l-10"
                                                id="next"
                                                icon="pebble-icon:action-scope-take-selection"
                                                title=${this.localize('MovToNxtTxt')}
                                                .raised=${true}
                                                @tap=${this._onNextTap}
                                            ></pebble-button>
                                            <div
                                                ?hidden=${this._hideSeperator(
                                                    this._showMessageOnly,
                                                    this.showActionButtons
                                                )}
                                                class="button-divider vertical-divider"
                                            ></div>
                                        `
                                      : html``}
                                  ${this._showActionButtons(
                                      this.showActionButtons,
                                      this.isCompareProcess,
                                      this.isCompareReadonly,
                                      this.tabularViewMode,
                                      this._selectedView
                                  )
                                      ? html`
                                            <div id="content-actions" class="buttonContainer-top-right" align="center">
                                                ${this.isCreateProcess
                                                    ? html`
                                                          <pebble-button
                                                              class="action-button btn btn-secondary m-l-10"
                                                              id="back"
                                                              .buttonText=${this.localize('ChaDatBtn')}
                                                              .raised=${true}
                                                              @tap=${this._onBackTap}
                                                          ></pebble-button>
                                                      `
                                                    : html``}
                                                ${this._allowAction(
                                                    'update',
                                                    this.isCreateProcess,
                                                    this._canMerge,
                                                    this._showDiscard,
                                                    this._hasReadPermission,
                                                    this.viewMode,
                                                    this.matchType
                                                )
                                                    ? html`
                                                          <pebble-button
                                                              class="action-button-focus dropdownText btn btn-primary m-l-10"
                                                              id="update"
                                                              .buttonText=${this.localize('UpdTxt')}
                                                              .raised=${true}
                                                              @tap=${this._onUpdateTap}
                                                          ></pebble-button>
                                                      `
                                                    : html``}
                                                ${this._allowAction(
                                                    'create',
                                                    this.isCreateProcess,
                                                    this.matchType,
                                                    this.viewMode,
                                                    this._allowCreate
                                                )
                                                    ? html`
                                                          <span title=${this.localize('MatMerCreBtnTT')}>
                                                              <pebble-button
                                                                  class="action-button-focus dropdownText btn btn-success m-l-10"
                                                                  id="create"
                                                                  .buttonText=${this.localize('CreTxt')}
                                                                  .raised=${true}
                                                                  @tap=${this._onCreateTap}
                                                              ></pebble-button>
                                                          </span>
                                                      `
                                                    : html``}
                                                ${this._allowAction(
                                                    'review',
                                                    this.isCreateProcess,
                                                    this._canMerge,
                                                    this._showDiscard,
                                                    this.viewMode
                                                )
                                                    ? html`
                                                          <pebble-button
                                                              class="action-button-focus dropdownText btn btn-secondary m-l-10"
                                                              id="review"
                                                              .buttonText=${this.localize('SendRvwBtn')}
                                                              .raised=${true}
                                                              @tap=${this._onSendForReviewTap}
                                                          ></pebble-button>
                                                      `
                                                    : html``}
                                                ${this._allowAction(
                                                    'approve',
                                                    this.showMergeButton,
                                                    this._canMerge,
                                                    this.isCreateProcess,
                                                    this.viewMode,
                                                    this._showMessageOnly
                                                )
                                                    ? html`
                                                          <!--Owned/Whereused process actions-->
                                                          ${!this.isCreateProcess
                                                              ? html`
                                                                    <pebble-button
                                                                        id="matchReviewRefreshBtn"
                                                                        icon="pebble-icon:refresh"
                                                                        class="icon pebble-icon-size-18 m-l-10"
                                                                        @tap=${this._OnRefreshClick}
                                                                        title=${this._refreshBtnTitle}
                                                                    ></pebble-button>
                                                                    ${this._isSourceSelectedAsRepresentative(
                                                                        this._isOwnedProcess,
                                                                        this.sourceEntity,
                                                                        this._config
                                                                    )
                                                                        ? html`
                                                                              <pebble-button
                                                                                  class="action-button btn btn-primary m-l-10"
                                                                                  id="discard"
                                                                                  .buttonText=${this.localize('DisBtn')}
                                                                                  .raised=${true}
                                                                                  @tap=${this._onStatusUpdate}
                                                                                  ?hidden=${this._hideAction(
                                                                                      'discard',
                                                                                      this.mergeReviewActionAccess
                                                                                  )}
                                                                              ></pebble-button>
                                                                              <pebble-button
                                                                                  class="action-button-focus dropdownText btn btn-success m-l-10"
                                                                                  id="create"
                                                                                  .buttonText=${this.localize('CreTxt')}
                                                                                  .raised=${true}
                                                                                  @tap=${this._onCreateTap}
                                                                                  data-args="createandlink"
                                                                                  ?hidden=${this._hideAction(
                                                                                      'create',
                                                                                      this.mergeReviewActionAccess,
                                                                                      this._hideSourceCreate
                                                                                  )}
                                                                              ></pebble-button>
                                                                          `
                                                                        : html`
                                                                              ${!this._isLinkAllowed(
                                                                                  this._isSourceOfRelationship,
                                                                                  this.entities,
                                                                                  this._config,
                                                                                  this._isWhereusedProcess
                                                                              )
                                                                                  ? html`
                                                                                        <pebble-button
                                                                                            class="action-button-focus dropdownText btn btn-primary m-l-10"
                                                                                            id="manualmerge"
                                                                                            .buttonText=${this._getSaveActionText(
                                                                                                this.isCompareProcess
                                                                                            )}
                                                                                            .raised=${true}
                                                                                            @tap=${this._onApproveTap}
                                                                                            data-args="manualmerge"
                                                                                            ?hidden=${this._hideAction(
                                                                                                'manualmerge',
                                                                                                this
                                                                                                    .mergeReviewActionAccess,
                                                                                                this.allowMergePreview,
                                                                                                this._isInitialDataLoad
                                                                                            )}
                                                                                        ></pebble-button>
                                                                                        <pebble-button
                                                                                            class="action-button-focus dropdownText btn btn-success m-l-10"
                                                                                            id="automerge"
                                                                                            .buttonText=${this.localize(
                                                                                                'AutMerTxt'
                                                                                            )}
                                                                                            .raised=${true}
                                                                                            @tap=${this._onLinkAndMerge}
                                                                                            data-args="automerge"
                                                                                            ?hidden=${this._hideAction(
                                                                                                'automerge',
                                                                                                this
                                                                                                    .mergeReviewActionAccess,
                                                                                                this.allowMergePreview,
                                                                                                this
                                                                                                    ._isWhereusedProcess,
                                                                                                this.isCompareProcess
                                                                                            )}
                                                                                        ></pebble-button>
                                                                                    `
                                                                                  : html`
                                                                                        <pebble-button
                                                                                            class="action-button-focus dropdownText btn btn-secondary m-l-10"
                                                                                            id="link"
                                                                                            .buttonText=${this.localize(
                                                                                                'LnkTxt'
                                                                                            )}
                                                                                            .raised=${true}
                                                                                            @tap=${this._onLinkTap}
                                                                                            ?hidden=${this._hideAction(
                                                                                                'link',
                                                                                                this
                                                                                                    .mergeReviewActionAccess
                                                                                            )}
                                                                                        ></pebble-button>
                                                                                        <pebble-button
                                                                                            class="action-button-focus dropdownText btn btn-primary m-l-10"
                                                                                            id="linkandmanualmerge"
                                                                                            .buttonText=${this.localize(
                                                                                                'LnkManMerTxt'
                                                                                            )}
                                                                                            .raised=${true}
                                                                                            @tap=${this._onLinkAndMerge}
                                                                                            data-args="linkandmanualmerge"
                                                                                            ?hidden=${this._hideAction(
                                                                                                'linkandmanualmerge',
                                                                                                this
                                                                                                    .mergeReviewActionAccess,
                                                                                                this.allowMergePreview,
                                                                                                this._isInitialDataLoad
                                                                                            )}
                                                                                        ></pebble-button>
                                                                                        <pebble-button
                                                                                            class="action-button-focus dropdownText btn btn-success m-l-10"
                                                                                            id="linkandautomerge"
                                                                                            .buttonText=${this.localize(
                                                                                                'LnkAutMerTxt'
                                                                                            )}
                                                                                            .raised=${true}
                                                                                            @tap=${this._onLinkAndMerge}
                                                                                            data-args="linkandautomerge"
                                                                                            ?hidden=${this._hideAction(
                                                                                                'linkandautomerge',
                                                                                                this
                                                                                                    .mergeReviewActionAccess,
                                                                                                this.allowMergePreview
                                                                                            )}
                                                                                        ></pebble-button>
                                                                                    `}
                                                                          `}
                                                                `
                                                              : html``}
                                                          ${this.isCreateProcess
                                                              ? html`
                                                                    <pebble-button
                                                                        class="action-button-focus dropdownText btn btn-primary m-l-10"
                                                                        id="update"
                                                                        .buttonText=${this.localize('UpdTxt')}
                                                                        .raised=${true}
                                                                        @tap=${this._onApproveTap}
                                                                        ?disabled=${this._disableApproveActions(
                                                                            'update',
                                                                            this.entities,
                                                                            this.sourceEntity,
                                                                            this._markAsRepTriggered
                                                                        )}
                                                                    ></pebble-button>
                                                                    <pebble-button
                                                                        class="action-button-focus dropdownText btn btn-secondary m-l-10"
                                                                        id="create"
                                                                        .buttonText=${this.localize('CreTxt')}
                                                                        .raised=${true}
                                                                        @tap=${this._onApproveTap}
                                                                        ?disabled=${this._disableApproveActions(
                                                                            'create',
                                                                            this.entities,
                                                                            this.sourceEntity,
                                                                            this._markAsRepTriggered
                                                                        )}
                                                                    ></pebble-button>
                                                                `
                                                              : html``}
                                                      `
                                                    : html``}
                                            </div>
                                        `
                                      : html``}
                                  ${this._isTabularView(this._selectedView)
                                      ? html`
                                            <pebble-button
                                                class="action-button-focus dropdownText btn btn-success m-l-10"
                                                id="showColumnarView"
                                                .buttonText=${this.localize('ShoColVieTxt')}
                                                .raised=${true}
                                                @tap=${this._showColumnarViewTap}
                                                ?disabled=${this._disableTabularViewAction(
                                                    this._tabularViewSelectedEntities
                                                )}
                                            ></pebble-button>
                                        `
                                      : html``}
                              </div>

                              ${this._showMatchMergeMessage(this.matchMergeMessage)
                                  ? html` <div class="title-text">${this.matchMergeMessage}</div> `
                                  : html``}
                              ${this._matchProcessMessage
                                  ? html`
                                        <div class="default-message">
                                            ${this._matchProcessMessage}
                                            ${this._showNewStateMessage
                                                ? html`
                                                      <span class="review-link" @tap=${this._onReviewMatches}
                                                          >${this.localize('RevTxt')}</span
                                                      >
                                                  `
                                                : html``}
                                            ${this._showTabularViewLink(
                                                this.allowTabularView,
                                                this._isMaxLimitExceedMessage
                                            )
                                                ? html`
                                                      <span class="addon-message">. ${this.localize('SwiToTxt')}</span>
                                                      <span class="review-link" @tap=${this._triggerShowTabularView}
                                                          >${this.localize('TabLbl')}</span
                                                      >
                                                  `
                                                : html``}
                                        </div>
                                    `
                                  : html``}
                              ${this._matchMergeInformation
                                  ? html`
                                        <div
                                            class=${this._getMessageClass(
                                                this._matchMergeInformation,
                                                this.isCompareProcess
                                            )}
                                        >
                                            ${this._matchMergeInformation}
                                        </div>
                                    `
                                  : html``}
                          </div>
                          ${!this._showMessageOnly
                              ? html`
                                    <div class="base-grid-structure-child-2">
                                        ${this._hasReadPermission
                                            ? html`
                                                  ${this._isRecommendationView(this.viewMode)
                                                      ? html`
                                                            <rock-merge-review-panel
                                                                .contextData=${this.contextData}
                                                                .config=${this._config}
                                                                .models=${this._models}
                                                                .gridConfig=${this.recommendationGridConfig}
                                                                .gridData=${this._gridData}
                                                                @grid-data-changed=${this._onGridDataChanged}
                                                                .gridColumns=${this._gridColumns}
                                                                .viewMode=${this.viewMode}
                                                                .mergeReviewValidition=${this._mergeReviewValidition}
                                                                .showRelationships=${this.showRelationships}
                                                            ></rock-merge-review-panel>
                                                        `
                                                      : html` <rock-tabs .config=${this._tabConfig}></rock-tabs> `}
                                              `
                                            : html`
                                                  <div class="no-perm-view">
                                                      <ul>
                                                          <li>${this.localize('IdTxt')}: ${this._matchedEntity.id}</li>
                                                          <li>
                                                              ${this.localize('NamTxt')}: ${this._matchedEntity.name}
                                                          </li>
                                                          <li>
                                                              ${this.localize('TypTxt')}: ${this._matchedEntity.type}
                                                          </li>
                                                      </ul>
                                                  </div>
                                              `}
                                    </div>
                                `
                              : html``}
                      </div>
                  `
                : html``}
            <pebble-dialog
                id="attributeDialog"
                .dialogTitle=${this.localize('CnfDiaTit')}
                .modal=${true}
                .medium=${true}
                .verticalOffset=${1}
                50=""
                .horizontalAlign="auto"
                .verticalAlign="auto"
                .noCancelOnOutsideClick=${true}
                .noCancelOnEscKey=${true}
                .showCloseIcon=${true}
                .showOk=${true}
                .showCancel=${true}
                alert-box
            >
                <div id="attrDialogContainer" class="overflow-auto"></div>
            </pebble-dialog>
            <pebble-dialog
                id="deleteConfirmDialog"
                .modal=${true}
                small
                .verticalOffset=${1}
                50=""
                .horizontalAlign="auto"
                .verticalAlign="auto"
                .noCancelOnOutsideClick=${true}
                .noCancelOnEscKey=${true}
                .dialogTitle=${this.localize('CnfDiaTit')}
            >
                <p>${this.localize('DelEntWar', 'entityName', this.sourceEntity.name)}</p>
                <p>${this._getLocalizedText('DelRvwTxt', 'entityType', this.sourceEntity)}</p>
                <div class="buttons">
                    <pebble-button
                        id="skip"
                        class="apply btn btn-secondary"
                        .buttonText=${this.localize('CanTxt')}
                        @tap=${this._cancelDeleteProcess}
                    ></pebble-button>
                    <pebble-button
                        id="ok"
                        class="close btn btn-success m-r-5"
                        .buttonText=${this.localize('DltTxt')}
                        @tap=${this._triggerDeleteProcess}
                    ></pebble-button>
                </div>
            </pebble-dialog>
            <pebble-dialog
                id="errorsDialog"
                .modal=${true}
                small
                .verticalOffset=${1}
                50=""
                .horizontalAlign="auto"
                .verticalAlign="auto"
                .noCancelOnOutsideClick=${true}
                .noCancelOnEscKey=${true}
                .dialogTitle=${this.localize('PagErrTit')}
            >
                <p>${this.localize('ErrLisTxt')}</p>
                <ul class="error-list">
                    ${this._syncValidationErrors.map(
                        item => html` <li>${item.attributeExternalName} : ${item.message}</li> `
                    )}
                </ul>
                <div class="buttons">
                    <pebble-button
                        id="ok"
                        class="apply btn btn-secondary m-r-5"
                        .buttonText=${this.localize('CanTxt')}
                        @tap=${this._fixServerErrors}
                    ></pebble-button>
                    <pebble-button
                        id="skip"
                        class="close btn btn-primary"
                        .buttonText=${this.localize('S&CBtn')}
                        @tap=${this._skipServerErrors}
                    ></pebble-button>
                </div>
            </pebble-dialog>
            <pebble-dialog
                id="unmergeIsSourceRelConfirmDialog"
                .modal=${true}
                small
                .verticalOffset=${1}
                50=""
                .horizontalAlign="auto"
                .verticalAlign="auto"
                .noCancelOnOutsideClick=${true}
                .noCancelOnEscKey=${true}
                .dialogTitle=${this.localize('CnfDiaTit')}
            >
                <p>${this.localize('UnMerRelConMsg')}</p>
                <div class="buttons">
                    <pebble-button
                        id="skip"
                        class="apply btn btn-secondary"
                        .buttonText=${this.localize('CanTxt')}
                        @tap=${this._cancelUnmergeIsSourceRelProcess}
                    ></pebble-button>
                    <pebble-button
                        id="ok"
                        class="close btn btn-success m-r-5"
                        .buttonText=${this.localize('UnMerTxt')}
                        @tap=${this._triggerUnmergeIsSourceRelProcess}
                    ></pebble-button>
                </div>
            </pebble-dialog>
            <pebble-popover
                id="popover-summary-list"
                class="popover-summary-list"
                for="summary-list"
                .noOverlap=${this.applyTrue}
                display-arrow-as-per-target
                .horizontalAlign="right"
            >
                <div class="summary-popup-title">${this.localize('SumTit')}</div>
                <div id="content-status" class=${this._getClassByBulkProcess(this.isBulkProcess)}>
                    <div class="content-status-message">
                        <div class="content-status-message--row">
                            <div class="status-info">
                                <span class="create-count">${this.reviewCreatedEntities}</span> ${this.localize(
                                    'CredTxt'
                                )}
                            </div>
                            <div class="status-info">
                                <span class="success-count">${this.reviewMergedEntities}</span> ${this.localize(
                                    'MerTxt'
                                )}
                            </div>
                            <div class="status-info">
                                <span class="success-count">${this.reviewLinked}</span> ${this.localize('LnkdTxt')}
                            </div>
                            <div class="status-info">
                                <span class="warning-count">${this.reviewDeleted}</span> ${this.localize('DelTxt')}
                            </div>
                        </div>
                        <div class="content-status-message--row">
                            <div class="status-info">
                                <span class="skipped-count">${this.reviewSkipped}</span> ${this.localize('SkidTxt')}
                            </div>
                            <div class="status-info">
                                <span class="error-count">${this.reviewPending}</span> ${this.localize('PenTxt')}
                            </div>
                            <div class="status-info">
                                <span class="warning-count">${this.reviewDiscarded}</span> ${this.localize('DisTxt')}
                            </div>
                            <div class="status-info">
                                <span class="warning-count">${this.reviewUnmergedEntities}</span> ${this.localize(
                                    'UnMerStaTxt'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </pebble-popover>
            <pebble-dialog
                id="matchInfoDialog"
                .modal=${true}
                .noCancelOnOutsideClick=${true}
                .noCancelOnEscKey=${true}
                .showCloseIcon=${true}
            >
                <div class="matchinfo-content">
                    <pebble-grid
                        id="matchInfoGrid"
                        .columns=${this._matchInfoGridColumns}
                        .gridData=${this._matchInfoGridItems}
                        .emptyMessage=${this.localize('NoDatAvaMsg')}
                        .isRowSelectable=${this._isMatchInfoGridRowSelectable}
                        .showEmptyMessageWithHeaders=${true}
                    >
                    </pebble-grid>
                </div>
            </pebble-dialog>
            ${this.showPermisionDenied
                ? html`
                      <rock-message-grid
                          .successMessage=${this._messageGridDialogSuccessMsg}
                          .errorMessage=${this._messageGridDialogErrorMsg}
                          .dialogTitle=${this._messageGridDialogTitle}
                          .erroredEntities=${this._erroredEntities}
                      >
                      </rock-message-grid>
                  `
                : html``}

            <bedrock-pubsub
                event-name="grid-header-selection-change"
                .handler=${this._onHeaderSelectionChange}
            ></bedrock-pubsub>
            <bedrock-pubsub
                event-name="grid-row-entity-selection"
                .handler=${this._onRowEntitySelection}
            ></bedrock-pubsub>
            <bedrock-pubsub
                event-name="mark-as-representative"
                .handler=${this._onMarkAsRepesentative}
            ></bedrock-pubsub>
            <bedrock-pubsub event-name="remove-source" .handler=${this._onDelete}></bedrock-pubsub>
            <bedrock-pubsub event-name="on-match-information" .handler=${this._showMatchInfoDialog}></bedrock-pubsub>
            <bedrock-pubsub event-name="merge-column-link-click" .handler=${this._onColumnLinkClick}></bedrock-pubsub>
            <bedrock-pubsub
                event-name="allow-merge-preview-change"
                .handler=${this._onAllowMergePreviewChange}
            ></bedrock-pubsub>
            <bedrock-pubsub
                event-name="on-strategy-show-or-hide"
                .handler=${this._onStrategyShowOrHide}
            ></bedrock-pubsub>
            <bedrock-pubsub event-name="component-created" .handler=${this._onTabComponentCreated}></bedrock-pubsub>
            <bedrock-pubsub
                event-name="rock-merge-grid-golden-data-change"
                .handler=${this._onGoldenDataChange}
            ></bedrock-pubsub>
            <bedrock-pubsub event-name="unmerge-source" .handler=${this._onUnmergeIsSourceofRel}></bedrock-pubsub>
            <bedrock-pubsub event-name="flip-source" .handler=${this._onFlipSource}></bedrock-pubsub>
        `;
    }

    get reviewCreatedEntities() {
        return this._reviewEntitiesCount(this.sourceEntitiesData, 'created');
    }
    get reviewMergedEntities() {
        return this._reviewEntitiesCount(this.sourceEntitiesData, 'merged');
    }
    get reviewSkipped() {
        return this._reviewEntitiesCount(this.sourceEntitiesData, 'skipped');
    }
    get reviewPending() {
        return this._reviewEntitiesCount(this.sourceEntitiesData, 'pending', this._sourceEntitiesIdTypeMappings);
    }
    get reviewDiscarded() {
        return this._reviewEntitiesCount(this.sourceEntitiesData, 'discarded');
    }
    get reviewDeleted() {
        return this._reviewEntitiesCount(this.sourceEntitiesData, 'deleted');
    }
    get reviewLinked() {
        return this._reviewEntitiesCount(this.sourceEntitiesData, 'linked');
    }
    get reviewUnmergedEntities() {
        return this._reviewEntitiesCount(this.sourceEntitiesData, 'unmerge');
    }
    get _reviewStatus() {
        return this._reviewStatusCount(this._sourceEntitiesIdTypeMappings, this.reviewIndex);
    }

    static get styles() {
        const customStyles = getCustomStylesForLit([
            'bedrock-style-common',
            'bedrock-style-grid-layout',
            'bedrock-style-padding-margin',
            'bedrock-vertical-divider'
        ]);

        return [...customStyles, styles, sharedStyles];
    }

    static get properties() {
        return {
            attributeNames: { type: Array },
            contextData: { type: Object, reflect: true },
            entityTitle: { type: String },
            domain: { type: String },
            showCreateButton: { type: Boolean },
            showMergeButton: { type: Boolean },
            attributeCollapsed: { type: Boolean },
            showActionButtons: { type: Boolean },
            enableColumnSelect: { type: Boolean },
            selectedEntityId: { type: String },
            sourceEntity: { type: Object, reflect: true },
            sourceEntityId: { type: String },
            sourceEntityType: { type: String },
            sourceEntities: { type: Array, reflect: true },
            sourceEntitiesData: { type: Array },
            matchTitle: { type: String },
            reviewCreatedEntities: { type: Number },
            reviewMergedEntities: { type: Number },
            reviewSkipped: { type: Number },
            reviewPending: { type: Number },
            reviewDiscarded: { type: Number },
            reviewDeleted: { type: Number },
            reviewLinked: { type: Number },
            reviewUnmergedEntities: { type: Number },
            reviewIndex: { type: Number },
            showAttributes: { type: Boolean },
            showRelationships: { type: Boolean },
            isBulkProcess: { type: Boolean },
            enableEntityHeaderLink: { type: Boolean },
            attributeMessages: { type: Object }, //notify
            isCreateProcess: { type: Boolean, reflect: true },
            processDetails: { type: Object, reflect: true },
            matchEntitiesLimit: { type: Number },
            hideDataFilter: { type: Boolean },
            viewMode: { type: String, reflect: true },
            recommendationGridConfig: { type: Object },
            matchMergeThreshold: { type: Object },
            matchType: { type: String },
            matchMergeMessage: { type: String },
            allowUpdate: { type: Boolean, reflect: true },
            selectedAttributeValueFilter: { type: String },
            selectedRelationshipValueFilter: { type: String },
            allowMergePreview: { type: Boolean },
            /** Flag used to prevent additional 'Create' on Golden Record Review */
            _hideSourceCreate: { type: Boolean },
            actions: { type: Object },
            defaultTabView: { type: String },
            sortBasedOnAttributeNames: { type: Boolean },
            restrictDeleteAction: { type: Boolean },
            viewSettings: { type: Object },
            selectPotentialMatches: { type: Boolean },
            mergeReviewActionAccess: { type: Object },
            attributesToBeFreezed: { type: Array },
            showPotentialMatch: { type: Boolean },
            isCompareProcess: { type: Boolean, reflect: true },
            isGRMV2Flow: { type: Boolean },
            isCompareReadonly: { type: Boolean },
            familyAttributesSequence: { type: Array },
            allowGraphView: { type: Boolean },
            allowChartView: { type: Boolean },
            allowTabularView: { type: Boolean },
            tabularViewMode: { type: String },
            allowStrategyColumn: { type: Boolean },
            _configSelectPotentialMatches: { type: Boolean },
            _combinedEntitySetForRender: { type: Array },
            _attributeGridConfig: { type: Object },
            _attributeGridData: { type: Array },
            _attributeRowsModel: { type: Array },
            _relationshipGridConfig: { type: Object },
            _relationshipGridData: { type: Array },
            _relationshipRowsModel: { type: Array },
            _contextData: { type: Object },
            _entityModels: { type: Array },
            _contexts: { type: Object },
            _attributeData: { type: Array },
            _relationshipData: { type: Array },
            _loading: { type: Boolean, reflect: true },
            _attributeModels: { type: Object },
            _relationshipModels: { type: Object },
            _matchThreshold: { type: Object },
            _operation: { type: String },
            _syncValidationErrors: { type: Array },
            _showMessageOnly: { type: Boolean },
            _matchProcessMessage: { type: String },
            _showDiscard: { type: Boolean },
            _mlBasedResults: { type: Array },
            _matchPermissions: { type: Object },
            _isValidForProcess: { type: Boolean },
            _isDiscardProcess: { type: Boolean },
            _draftTypePattern: { type: String },
            _showAccordion: { type: Boolean },
            _noMatchesFound: { type: Boolean },
            _sourceEntitiesIdTypeMappings: { type: Array },
            _isReviewEntity: { type: Boolean },
            _isRelationshipProcess: { type: Boolean },
            _isOwnedProcess: { type: Boolean },
            _isWhereusedProcess: { type: Boolean },
            _isLinkProcess: { type: Boolean },
            _updatedAttributesList: { type: Array },
            _revertContextChanges: { type: Boolean },
            _newDimensions: { type: Object },
            _currentDimensions: { type: Object },
            _createdEntity: { type: Object },
            _relationshipsAfterApprove: { type: Object },
            _isAnyChangeInGoldenData: { type: Boolean },
            _previousChangedAttributeDetails: { type: Object },
            _previousApprovedAttributeDetails: { type: Array },
            _relationshipReferenceAttributeNames: { type: Array },
            _showAttributePermissionDeniedMessage: { type: Boolean },
            _showRelationshipPermissionDeniedMessage: { type: Boolean },
            _sourceExternalAttributeName: { type: String },
            _models: { type: Object },
            _gridData: { type: Object },
            _gridColumns: { type: Object },
            _config: { type: Object },
            _mergeReviewValidition: { type: Object },
            _previewAssetAttribute: { type: String },
            _originalAssetAttribute: { type: String },
            _hasReadPermission: { type: Boolean },
            _matchedEntity: { type: Boolean },
            _isInitialLoad: { type: Boolean },
            _selectedView: { type: String },
            _reloadTabComponent: { type: Boolean },
            _originalComponentData: { type: Object },
            _markAsRepTriggered: { type: Boolean },
            _isPreviewChanged: { type: Boolean },
            _notificationRefresh: { type: Boolean },
            _mergePreviewToggleChangeTriggered: { type: Boolean },
            _toggleEvent: { type: Object },
            _potentialMatchesFlagChangeEvent: { type: Object },
            _potentialMatchesFlagChangeTriggered: { type: Boolean },
            _isNextLoad: { type: Boolean },
            _allowCreate: { type: Boolean },
            _isContextChanged: { type: Boolean },
            _initialContextData: { type: Object },
            _isMatchFeedbackCollectionEnabled: { type: Boolean },
            _enforceManageModelForMerge: { type: Boolean },
            _userAsSource: { type: Boolean },
            _transformedSourceEntity: { type: Object },
            _modelVersion: { type: String },
            _configAllowMergePreview: { type: Boolean },
            _isModelAvailable: { type: Boolean },
            _enableFeedbackCollection: { type: Boolean },
            _triggerFeedbackEvent: { type: Boolean },
            _isSourceOfRelationship: { type: Object },
            _grmMappingConfig: { type: Object },
            _notificationAwaitTracker: { type: Array },
            _typeIconMapper: { type: Object },
            _processMessage: { type: String },
            _processStatus: { type: String },
            _processFinished: { type: Boolean },
            _matchProcessType: { type: String },
            _grmStates: { type: Object },
            _entitiesGRMStates: { type: Object },
            _grmAttributeNames: { type: Object },
            _dirtyCheckMessage: { type: String },
            _linkConfirmationMessage: { type: String },
            _waitForLinkProcessSave: { type: Boolean },
            _reviewStatus: { type: String },
            _ownedRelationshipLimitExceeded: { type: Boolean },
            _showNewStateMessage: { type: Boolean },
            _ignoreShowNewStateMessage: { type: Boolean },
            _triggerLinkConfirmationDialog: { type: Boolean },
            _previousContextData: { type: Object },
            _modelExternalAttributes: { type: Array },
            _modelList: { type: Array },
            _isInitialDataLoad: { type: Boolean },
            _mergeGridDataLoading: { type: Boolean, reflect: true },
            _familyAttributes: { type: Object },
            _familySourceAttributes: { type: Object },
            _deterministicMatchAttributes: { type: Array },
            _isMatchInfoGridRowSelectable: { type: Boolean },
            _familyNames: { type: Object },
            _matchMergeInformation: { type: String },
            _isCreateProcessWithNoMatch: { type: Boolean },
            _allowedAttributesAndRelationships: { type: Object },
            _matchRelationshipNames: { type: Object },
            _grStates: { type: Object },
            _grAttributeNames: { type: Object },
            _unmergeColumnId: { type: String },
            _isTabChangeProcess: { type: Boolean },
            _tabularViewSelectedEntities: { type: Array },
            _ignoreDefaultViewSelection: { type: Boolean },
            _isMaxLimitExceedMessage: { type: Boolean },
            _sourceAllowedAttributes: { type: Array },
            _messageGridDialogSuccessMsg: { type: String },
            _messageGridDialogErrorMsg: { type: String },
            _erroredEntities: { type: Array },
            showPermisionDenied: { type: Boolean },
            _messageGridDialogTitle: { type: String },
            autoRefreshOnProcessCompleteNotification: { type: Boolean },
            _triggerReloadSourceEntity: { type: Boolean },
            _confirmRefreshClick: { type: Boolean },
            _refreshBtnTitle: { type: String },
            processCompleteTimer: { type: Number },
            applyTrue: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.attributeNames = [];
        this.contextData = {};
        this.entityTitle = 'id';
        this.domain = '';
        this.showCreateButton = true;
        this.showMergeButton = true;
        this.attributeCollapsed = false;
        this.showActionButtons = true;
        this.enableColumnSelect = true;
        this.selectedEntityId = '';
        this.sourceEntity = {};
        this.sourceEntityId = '';
        this.sourceEntityType = '';
        this.sourceEntities = [];
        this.sourceEntitiesData = [];
        this.matchTitle = '{noOfEntities} match(es) found, select an entity to approve or discard the draft entity';
        this.reviewIndex = 0;
        this.showAttributes = true;
        this.showRelationships = true;
        this.isBulkProcess = false;
        this.enableEntityHeaderLink = true;
        this.attributeMessages = {};
        this.isCreateProcess = false;
        this.processDetails = {};
        this.matchEntitiesLimit = 5;
        this.hideDataFilter = false;
        this.viewMode = 'mergereview';
        this.recommendationGridConfig = {};
        this.matchMergeThreshold = {};
        this.matchType = '';
        this.matchMergeMessage = '';
        this.allowUpdate = false;
        this.selectedAttributeValueFilter = 'None';
        this.selectedRelationshipValueFilter = 'None';
        this.allowMergePreview = true;
        this._hideSourceCreate = false;
        this.actions = {
            'match-merge-graph-view-representative-action-click': {
                name: 'match-merge-graph-view-representative-action-click'
            },
            'tabs-change': {
                name: 'tabs-change'
            },
            'govern-complete': {
                name: 'govern-complete'
            },
            'save-complete': {
                name: 'save-complete'
            },
            'context-loaded': {
                name: 'context-loaded'
            },
            'rock-merge-grid-loaded-action': {
                name: 'rock-merge-grid-loaded-action'
            },
            'relationship-opened': {
                name: 'relationship-opened'
            }
        };
        this.sortBasedOnAttributeNames = true;
        this.restrictDeleteAction = false;
        this.viewSettings = {};
        this.selectPotentialMatches = false;
        this.mergeReviewActionAccess = {
            create: true,
            discard: false,
            automerge: true,
            manualmerge: true,
            link: true,
            linkandautomerge: true,
            linkandmanualmerge: true
        };
        this.attributesToBeFreezed = [];
        this.showPotentialMatch = true;
        this.isCompareProcess = false;
        this.isGRMV2Flow = false;
        this.isCompareReadonly = false;
        this.familyAttributesSequence = [];

        this.allowGraphView = false;
        this.allowChartView = false;
        this.allowTabularView = true;
        this.tabularViewMode = 'readonly';
        this.allowStrategyColumn = true;
        this._configSelectPotentialMatches = false;
        this._combinedEntitySetForRender = [];
        this._attributeGridConfig = {};
        this._attributeGridData = [];
        this._attributeRowsModel = [];
        this._relationshipGridConfig = {};
        this._relationshipGridData = [];
        this._relationshipRowsModel = [];
        this._contextData = {};
        this._entityModels = [];
        this._contexts = {};
        this._attributeData = [];
        this._relationshipData = [];

        this._loading = false;
        this._attributeModels = {};
        this._relationshipModels = {};
        this._matchThreshold = {
            create: 0,
            merge: 100
        };
        this._operation = 'create';
        this._syncValidationErrors = [];
        this._showMessageOnly = false;
        this._matchProcessMessage = '';
        this._showDiscard = false;
        this._mlBasedResults = [];
        this._matchPermissions = {
            submitPermission: true,
            mergePermission: false
        };
        this._isValidForProcess = true;
        this._isDiscardProcess = false;
        this._draftTypePattern = /^rsdraft/i;
        this._showAccordion = true;
        this._noMatchesFound = false;

        this._sourceEntitiesIdTypeMappings = [];
        this._isReviewEntity = false;
        this._isRelationshipProcess = false;
        this._isOwnedProcess = false;
        this._isWhereusedProcess = false;
        this._isLinkProcess = false;
        this._updatedAttributesList = [];
        this._revertContextChanges = false;
        this._newDimensions = {};

        this._currentDimensions = {};
        this._createdEntity = {};
        this._relationshipsAfterApprove = {};

        this._isAnyChangeInGoldenData = false;
        this._previousChangedAttributeDetails = {};
        this._previousApprovedAttributeDetails = [];
        this._relationshipReferenceAttributeNames = [];

        this._showAttributePermissionDeniedMessage = false;
        this._showRelationshipPermissionDeniedMessage = false;
        this._sourceExternalAttributeName = '';
        this._models = {};
        this._gridData = {};
        this._gridColumns = {};
        this._config = {};
        this._mergeReviewValidition = {};
        this._originalAssetAttribute = this._computeOriginalAssetAttribute();
        this._hasReadPermission = true;
        this._matchedEntity = {};
        this._isInitialLoad = true;
        this._selectedView = 'columnar';
        this._reloadTabComponent = false;
        this._originalComponentData = {};
        this._markAsRepTriggered = false;
        this._isPreviewChanged = false;
        this._notificationRefresh = false;
        this._mergePreviewToggleChangeTriggered = false;
        this._toggleEvent = {};
        this._potentialMatchesFlagChangeEvent = {};
        this._potentialMatchesFlagChangeTriggered = false;
        this._isNextLoad = false;
        this._allowCreate = true;
        this._isContextChanged = false;
        this._initialContextData = {};
        this._isMatchFeedbackCollectionEnabled = false;
        this._enforceManageModelForMerge = false;
        this._userAsSource = false;
        this._transformedSourceEntity = {};
        this._modelVersion = '1.0.0';
        this._configAllowMergePreview = true;

        this._isModelAvailable = false;
        this._enableFeedbackCollection = false;
        this._triggerFeedbackEvent = false;
        this._isSourceOfRelationship = {};

        this._grmMappingConfig = {};
        this._notificationAwaitTracker = [];
        this._typeIconMapper = {};
        this._processMessage = '';

        this._processStatus = '';
        this._processFinished = false;
        this._matchProcessType = '';
        this._grmStates = {
            update: 'Update',
            inreview: 'In Review',
            new: 'New',
            done: 'Done',
            manualmerged: 'Manual Merged',
            discarded: 'Discarded',
            unmerged: 'Un Merged',
            autocreated: 'Auto Created',
            automerged: 'Auto Merged',
            manualcreated: 'Manual Created',
            premerged: 'Pre Merged'
        };

        this._entitiesGRMStates = {};
        this._grmAttributeNames = {
            grmState: 'grmstate',
            grmProcessState: 'grmprocessstate'
        };
        this._dirtyCheckMessage = '';
        this._linkConfirmationMessage = '';
        this._waitForLinkProcessSave = false;
        this._ownedRelationshipLimitExceeded = false;
        this._showNewStateMessage = false;
        this._ignoreShowNewStateMessage = false;
        this._triggerLinkConfirmationDialog = false;
        this._previousContextData = {};
        this._modelList = [];
        this._isInitialDataLoad = true;
        this._mergeGridDataLoading = true;
        this._familyAttributes = {};

        this._familySourceAttributes = {};
        this._deterministicMatchAttributes = {};
        this._isMatchInfoGridRowSelectable = false;
        this._familyNames = {};

        this._matchMergeInformation = '';
        this._isCreateProcessWithNoMatch = false;
        this._allowedAttributesAndRelationships = {};
        this._matchRelationshipNames = {
            issourceof: 'issourceof',
            potentialmatches: 'potentialmatches'
        };

        this._grStates = {
            recompute: 'Recompute'
        };
        this._grAttributeNames = {
            grState: 'grstate'
        };
        this._unmergeColumnId = '';
        this._isTabChangeProcess = false;
        this._tabularViewSelectedEntities = [];
        this._ignoreDefaultViewSelection = false;
        this._isMaxLimitExceedMessage = false;
        this._sourceAllowedAttributes = [];
        this._messageGridDialogSuccessMsg = '';
        this._messageGridDialogErrorMsg = '';
        this._erroredEntities = [];
        this.showPermisionDenied = false;
        this._messageGridDialogTitle = '';
        this.autoRefreshOnProcessCompleteNotification = false;
        this._triggerReloadSourceEntity = false;
        this._confirmRefreshClick = false;
        this._refreshBtnTitle = '';
        this.processCompleteTimer = 10000;
        this.applyTrue = true;
    }

    async connectedCallback() {
        super.connectedCallback();
        this._refreshBtnTitle = this.localize('RfsTxt');
        let mainApp = OSElements.mainApp;
        if (mainApp && mainApp.tenantSettings) {
            this._isMatchFeedbackCollectionEnabled = !!mainApp.tenantSettings.isMatchFeedbackCollectionEnabled;
            this._enforceManageModelForMerge = !!mainApp.tenantSettings.enforceManageModelForMerge;
            this._userAsSource = !!mainApp.tenantSettings.userAsSource;
        }
        await this._preFetchMergeDetails();
    }

    disconnectedCallback() {
        clearTimeout(this.notificationTimer);
        super.disconnectedCallback();
    }

    listen(node, eventName, handler) {
        node.addEventListener(eventName, handler);
    }

    unlisten(node, eventName, handler) {
        node.removeEventListener(eventName, handler);
    }

    update(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            this._onPropertyChange(propName);
        });

        super.update();
    }

    _onPropertyChange(propertyName) {
        switch (propertyName) {
            case 'contextData':
                this._onContextChanged();
                break;

            case 'sourceEntities':
                this._onContextChanged();
                this._initiateMatchMergeReview();
                break;

            case 'isCompareProcess':
                this._initiateMatchMergeReview();
                break;

            case 'isCreateProcess':
            case 'processDetails':
                this._initiateMatchMergeCreate();
                break;

            case 'viewMode':
                this._onViewModeChange();
                break;

            case 'sourceEntity':
                this._onSourceEntityChange();
                break;

            case 'recommendationGridConfig':
                this._previewAssetAttribute = this._computePreviewAssetAttribute();
                break;

            case '_modelList':
                this._modelExternalAttributes = this._getModelExternalAttributes();
                break;

            case '_loading':
            case '_mergeGridDataLoading':
                this._onLoadingChange();
                break;

            default:
                break;
        }
    }

    async _preFetchMergeDetails() {
        await this._prepareGRMStates(['grmstateref', 'grmprocessstateref']);
        await this._setGRMMappingConfig();
    }

    async _prepareGRMStates(referenceTypes) {
        if (ObjectUtils.isEmpty(referenceTypes)) {
            return;
        }
        let getReferenceCallList = [];
        for (let referenceType of referenceTypes) {
            getReferenceCallList.push(await ReferenceManager.getReferenceData(referenceType));
        }
        let grmStateResponseList = await Promise.all(getReferenceCallList);
        if (!ObjectUtils.isEmpty(grmStateResponseList)) {
            for (let grmStates of grmStateResponseList) {
                if (!ObjectUtils.isEmpty(grmStates)) {
                    grmStates.forEach(item => {
                        if (item.data && item.data.attributes) {
                            let code = AttributeUtils.getFirstAttributeValue(item.data.attributes['code']);
                            let value = AttributeUtils.getFirstAttributeValue(item.data.attributes['value']);
                            if (code && value) {
                                code = code.toLowerCase().replaceAll(/\s/g, '');
                                this._grmStates[code] = value;
                            }
                        }
                    });
                }
            }
        }
    }

    async _setGRMMappingConfig() {
        this._grmMappingConfig = await MatchMergeHelper.getGRMAppConfigData();
        if (ObjectUtils.isEmpty(this._grmMappingConfig)) {
            LoggerManager.logError(this, 'GRM Mappings config get failed with error');
        }
    }

    async _getConfig(id, type) {
        let configRequest = DataRequestHelper.createConfigInitialRequest({});
        if (ObjectUtils.isValidObjectPath(configRequest, 'params.query')) {
            delete configRequest.params.query.contexts;
            configRequest.params.query.id = id;
            if (!configRequest.params.query.filters) {
                configRequest.params.query.filters = {};
            }
            configRequest.params.query.filters.typesCriterion = [type];
        }
        let url = '/data/pass-through/configurationservice/get';
        let configResponse = await DataObjectManager.rest(url, configRequest);
        return configResponse;
    }

    async actionCallback(actionName, detail) {
        switch (actionName) {
            case 'match-merge-graph-view-representative-action-click': {
                this._onMarkAsRepesentative({ detail: detail });
                break;
            }
            case 'tabs-change': {
                this._onTabsChange(detail);
                break;
            }
            case 'govern-complete': {
                this._onGovernComplete(detail);
                break;
            }
            case 'save-complete': {
                this._onSaveComplete(detail);
                break;
            }
            case 'context-loaded': {
                this._onContextsChanged(detail);
                break;
            }
            case 'rock-merge-grid-loaded-action': {
                this._mergeGridDataLoading = false;
                break;
            }
            case 'relationship-opened': {
                if (!this.relGridColumnsModelAndDataLoaded) {
                    await this._loadRelationshipAccordion();
                    this._ignoreDefaultViewSelection = true;
                    this._isInitialLoad = true;
                    this._initiateLoad();
                }
                break;
            }
        }
    }

    get mergeReviewPanelEl() {
        let tabs = this.shadowRoot.querySelector('rock-tabs');
        let mergeReviewPanel;
        if (this.viewMode != 'recommendation' && tabs) {
            mergeReviewPanel = tabs.shadowRoot.querySelector('rock-merge-review-panel');
        } else {
            mergeReviewPanel = this.shadowRoot.querySelector('rock-merge-review-panel');
        }
        return mergeReviewPanel;
    }

    getViewElByMode(mode) {
        const tabs = this.shadowRoot.querySelector('rock-tabs');
        if (mode && tabs) {
            switch (mode) {
                case 'graph':
                    return tabs.shadowRoot.querySelector('rock-match-merge-graph-view');
                case 'chart':
                    return tabs.shadowRoot.querySelector('rock-match-merge-chart-view');
                default:
                    LoggerManager.logError(this, 'Unknown view mode');
            }
        }
    }

    get potentialMatchesFlagEl() {
        let checkbox = this.shadowRoot.querySelector('pebble-checkbox');
        return checkbox;
    }

    _getCurrentActiveComponent() {
        const views = ['graph', 'chart'];
        if (views.includes(this._selectedView)) {
            return this.getViewElByMode(this._selectedView);
        }
        return this.mergeReviewPanelEl;
    }

    _updateNotificationTracker(detail) {
        if (ObjectUtils.isValidObjectPath(detail, 'data.context.id')) {
            let foundIndex = this._notificationAwaitTracker.findIndex(
                item => item.id == detail.data.context.id && item.type == detail.data.context.type
            );
            if (foundIndex != -1) {
                this._notificationAwaitTracker.splice(foundIndex, 1);
            }
        }
    }

    _onGovernComplete(detail) {
        this._updateNotificationTracker(detail);
        this._governDebouncer = Debouncer.debounce(this._governDebouncer, timeOut.after(500), () => {
            if (this._notificationAwaitTracker.length == 0) {
                this._notificationRefresh = true;
                this._reloadSourceEntity();
            }
        });
    }

    _onSaveComplete(detail) {
        this._updateNotificationTracker(detail);
        if (this._waitForLinkProcessSave && this._matchProcessType == 'linkandautomerge') {
            this._waitForLinkProcessSave = false;
            this._loading = true;
            this._triggerAutoMergeProcess();
        }
    }

    _initiateMatchMergeReview() {
        if (this.isCreateProcess || ObjectUtils.isEmpty(this.sourceEntities)) {
            return;
        }

        this._compareDebouncer = Debouncer.debounce(this._compareDebouncer, timeOut.after(50), () => {
            this._onSourceEntitiesChange();
        });
    }

    _initiateMatchMergeCreate() {
        if (
            this.isCreateProcess &&
            !ObjectUtils.isEmpty(this.processDetails) &&
            !ObjectUtils.isEmpty(this.processDetails.contextData) &&
            !ObjectUtils.isEmpty(this.processDetails.sourceEntity)
        ) {
            this.contextData = this.processDetails.contextData;
            this._allowCreate = this.processDetails.allowCreate;
        }
    }

    async _onContextChanged() {
        //Source entities are also needed to continue the process when user is doing match review from discovery and manage
        if (
            ObjectUtils.isEmpty(this.contextData) ||
            (ObjectUtils.isEmpty(this.sourceEntities) && !this.isCreateProcess)
        ) {
            return;
        }

        //Do not trigger the process if there is no difference in previous context
        if (ObjectUtils.compareObjects(this._previousContextData, this.contextData) && !this.isCreateProcess) {
            return;
        }
        this._previousContextData = ObjectUtils.cloneObject(this.contextData);

        let context = ObjectUtils.cloneObject(this.contextData);
        let firstDomainContext = ContextUtils.getFirstDomainContext(context);
        this.domain = firstDomainContext ? firstDomainContext.domain : '';
        let firstItemContext = ContextUtils.getFirstItemContext(context);

        if (ObjectUtils.isEmpty(this.domain) && !ObjectUtils.isEmpty(firstItemContext)) {
            this.domain = await EntityTypeManager.getDomainByType(firstItemContext.type);
            context[ContextUtils.CONTEXT_TYPE_DOMAIN] = [
                {
                    domain: this.domain
                }
            ];
        }

        //App specific
        let appContext = ContextUtils.getFirstAppContext(context);
        if (appContext) {
            this.appName = appContext.app;
        }
        if (!this.appName) {
            //TODO:: Need to check why app name is not coming mostly config issue.
            this.appName = AppInstanceManager.getCurrentActiveAppName(this) || 'app-business-function';
            if (this.appName) {
                context[ContextUtils.CONTEXT_TYPE_APP] = [
                    {
                        app: this.appName
                    }
                ];
            }
        }

        //To load context selector from manage
        if (!this.isBulkProcess && this.appName == 'app-entity-manage') {
            if (firstItemContext) {
                this.sourceEntityType = firstItemContext.type;
                this.sourceEntityId = firstItemContext.id;
            }
        }

        if (firstItemContext) {
            firstItemContext.type = firstItemContext.type.replace(this._draftTypePattern, '');
        }

        if (!ObjectUtils.isEmpty(this.sourceEntities) || this.isCreateProcess) {
            //TODO, If any new config needed for compare, then change the component name to get the proper config
            this.requestConfig('rock-match-merge', context);
        }

        if (ObjectUtils.isEmpty(this.recommendationGridConfig)) {
            this._onViewModeChange();
        }

        //Set preSelectedcontexts
        this._setPreSelectedContexts(context);
    }

    async _onViewModeChange() {
        if (this.viewMode == 'recommendation' && !ObjectUtils.isEmpty(this.contextData)) {
            let context = ObjectUtils.cloneObject(this.contextData);

            let firstItemContext = ContextUtils.getFirstItemContext(context);
            let entityType = firstItemContext && firstItemContext.type ? firstItemContext.type : undefined;
            let domain = '';
            if (entityType) {
                domain = await EntityTypeManager.getDomainByType(entityType);
                context[ContextUtils.CONTEXT_TYPE_DOMAIN] = [
                    {
                        domain: domain
                    }
                ];
            }

            let configResponse = await ConfigurationManager.getConfig('rock-entity-search-result', context);
            if (configResponse && configResponse.response.status == 'success') {
                LocalizationManager.localizeConfigData(configResponse);
                this._configGetSuccess(configResponse);
            } else {
                this._configGetError(configResponse);
            }
        }
    }

    async _configGetSuccess(configResponse) {
        let res = configResponse.response.content;
        let compConfig = {};

        if (ObjectUtils.isValidObjectPath(res, 'configObjects.0.data.contexts.0.jsonData')) {
            compConfig = res.configObjects[0].data.contexts[0].jsonData;

            if (ObjectUtils.isEmpty(compConfig)) {
                LoggerManager.logError(this, 'UI config is empty');
            } else {
                if (compConfig.config) {
                    compConfig.config.gridConfig.itemConfig.isMultiSelect = false;
                    this.recommendationGridConfig = compConfig.config.gridConfig;
                }
            }
        }
    }

    _configGetError(configResponse) {
        this.loading = false;
        LoggerManager.logError(this, 'UI config get failed with error');
    }

    _setPreSelectedContexts(context) {
        let dataContext = ContextUtils.getFirstDataContext(context);
        let valueContext = ContextUtils.getFirstValueContext(context);
        let preSelectedContexts = {};

        if (!ObjectUtils.isEmpty(dataContext)) {
            for (let key in dataContext) {
                preSelectedContexts[key] = [
                    {
                        id: dataContext[key],
                        title: dataContext[key],
                        type: key
                    }
                ];
            }
        }

        if (!ObjectUtils.isEmpty(valueContext)) {
            for (let key in valueContext) {
                preSelectedContexts[key] = [
                    {
                        id: valueContext[key],
                        title: valueContext[key],
                        type: key
                    }
                ];
            }
        }

        if (!ObjectUtils.isEmpty(preSelectedContexts)) {
            this.preSelectedContexts = preSelectedContexts;
        }
    }

    _getClassByBulkProcess(isBulkProcess) {
        if (isBulkProcess) {
            return 'widget-box';
        }
        return '';
    }

    //Config properties are already set in config behavior
    async onConfigLoaded(componentConfig) {
        if (ObjectUtils.isValidObjectPath(componentConfig, 'config.properties.defaultAttributeValueFilter')) {
            this.selectedAttributeValueFilter = componentConfig.config.properties.defaultAttributeValueFilter;
        }
        if (ObjectUtils.isValidObjectPath(componentConfig, 'config.properties.defaultRelationshipValueFilter')) {
            this.selectedRelationshipValueFilter = componentConfig.config.properties.defaultRelationshipValueFilter;
        }
        this._configAllowMergePreview = this.allowMergePreview;
        this._configSelectPotentialMatches = this.selectPotentialMatches;

        if (ObjectUtils.isEmpty(this._familyAttributes)) {
            await this._setEntityFamilyAttributes();
        }

        let selectedView = 'columnar';
        if (!this.isCompareProcess && ['graph', 'chart', 'tabular'].includes(this.defaultTabView)) {
            selectedView = this.defaultTabView;
        }
        this._selectedView = selectedView;

        this._changeSourceEntity();

        if (this.viewMode == 'recommendation') {
            this.hideDataFilter = true;
        }
    }

    async _onSourceEntitiesChange() {
        if (!ObjectUtils.isEmpty(this.sourceEntities)) {
            let compareEntitiesIdTypeMappings = [];
            let sourceEntitiesIdTypeMappings = [];
            for (let sourceEntity of this.sourceEntities) {
                if (sourceEntity) {
                    sourceEntitiesIdTypeMappings.push({ id: sourceEntity.id, type: sourceEntity.type });
                }
            }
            if (this.isCompareProcess) {
                compareEntitiesIdTypeMappings.push({
                    id: this.sourceEntities[0].id,
                    type: this.sourceEntities[0].type
                });
                this._compareEntities = sourceEntitiesIdTypeMappings;
            }
            this._sourceEntitiesIdTypeMappings = this.isCompareProcess
                ? compareEntitiesIdTypeMappings
                : sourceEntitiesIdTypeMappings;
        }
    }

    _onNextTap(e) {
        if (ObjectUtils.isEmpty(this.sourceEntitiesData)) {
            return;
        }

        //Dirty check
        if (this.isGoldenDataDirty()) {
            this._isNextActionTriggered = true;
            this._openDiscardChangesConfirmationDialog();
            return;
        }
        this._triggerMoveNext();
    }

    _triggerMoveNext() {
        if (this.sourceEntitiesData[this.reviewIndex].status == 'pending') {
            this.sourceEntitiesData[this.reviewIndex].status = 'skipped';
            this._notifySourceEntities();
        }
        this._moveToNextEntity();
    }

    _moveToNextEntity() {
        if (this._sourceEntitiesIdTypeMappings[this.reviewIndex + 1]) {
            this.reviewIndex++;
            this._isNextLoad = true;
            this.allowMergePreview = this._configAllowMergePreview;
            this.selectPotentialMatches = this._configSelectPotentialMatches;
            this._ignoreShowNewStateMessage = false;
            this._getSourceEntity(this.reviewIndex);
        } else {
            if (!this.reviewPending) {
                this._matchProcessMessage = this.localize('RvwComSelEntMsg');
                this.showActionButtons = false;
                this._showMessageOnly = true;
                let resultObj = this._prepareResults();
                this.dataFunctionComplete(resultObj, [], false, true);

                let action = this.aci.createAction({
                    name: 'show-final-details',
                    detail: resultObj
                });
                this.aci.dispatch(action);
                this._triggerEventOnSourceChange();
            }
        }
    }

    async _setDeterministicMatchAttributes() {
        let grEntityType = MatchMergeHelper.getGREntityType(this._grmMappingConfig, this.sourceEntityType);
        if (!grEntityType || (this._deterministicMatchAttributes && this._deterministicMatchAttributes[grEntityType])) {
            return;
        }
        let matchConfigResponse = await this._getConfig(`${grEntityType}_matchConfig`, 'matchConfig');
        let deterministicMatchAttributes = [];
        let isProbabilisticMatchApplicable = false;
        if (matchConfigResponse && matchConfigResponse.response.status == 'success') {
            let res = matchConfigResponse.response;
            if (ObjectUtils.isValidObjectPath(res, 'configObjects.0.data.jsonData.matchRules')) {
                //Is probabilistic match applicable
                isProbabilisticMatchApplicable = !ObjectUtils.isEmpty(
                    res.configObjects[0].data.jsonData.matchRules.find(rule => rule.matchType == 'probabilistic')
                );

                let deterministicMatchRules = res.configObjects[0].data.jsonData.matchRules.filter(
                    rule => rule.matchType == 'deterministic'
                );

                if (
                    ObjectUtils.isValidObjectPath(
                        deterministicMatchRules,
                        '0.searchQuery.query.filters.attributesCriterion'
                    )
                ) {
                    deterministicMatchRules.forEach(deterministicMatchRule => {
                        let attributesCriterion = deterministicMatchRule.searchQuery.query.filters.attributesCriterion;
                        attributesCriterion.forEach(criterion => {
                            deterministicMatchAttributes = deterministicMatchAttributes.concat(Object.keys(criterion));
                        });
                    });
                }
            }
        }

        //If match config or attributes not available, then get externalName, identifier from model
        if (ObjectUtils.isEmpty(deterministicMatchAttributes)) {
            deterministicMatchAttributes = await this._getGRMatchAttributesFromModel(grEntityType);
        }

        this._deterministicMatchAttributes[grEntityType] = {
            attributes: _.uniq(deterministicMatchAttributes),
            isProbabilisticMatchApplicable: isProbabilisticMatchApplicable
        };
    }

    async _getGRMatchAttributesFromModel(grEntityType) {
        let deterministicMatchAttributes = {};
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [{ type: grEntityType }];
        let grModelResponse = await this._getCompositeModel(clonedContextData);
        let dataContext = ContextUtils.getFirstDataContext(clonedContextData);
        let grAttributes = {};
        if (ObjectUtils.isEmpty(dataContext)) {
            if (ObjectUtils.isValidObjectPath(grModelResponse, 'data.attributes')) {
                grAttributes = grModelResponse.data.attributes;
            }
        } else {
            if (ObjectUtils.isValidObjectPath(grModelResponse, 'data.contexts.0.attributes')) {
                grAttributes = grModelResponse.data.contexts[0].attributes;
            }
        }
        if (grAttributes) {
            deterministicMatchAttributes = Object.keys(grAttributes).filter(
                key =>
                    grAttributes[key].properties &&
                    (grAttributes[key].properties.isEntityIdentifier || grAttributes[key].properties.isExternalName)
            );
        }
        return deterministicMatchAttributes;
    }

    async _setEntityFamilyAttributes() {
        let entityTypes = await EntityTypeManager.getEntityTypesByDomain(this.domain);
        if (ObjectUtils.isEmpty(entityTypes)) {
            return;
        }

        let profileGetCallList = [];
        for (let type of entityTypes) {
            profileGetCallList.push(this._getConfig(`${type}_matchProfile`, 'matchProfile'));
        }

        let familyAttributes = ['score'];
        let familySourceAttributes = {};
        if (!ObjectUtils.isEmpty(profileGetCallList)) {
            let profileGetResponseList = await Promise.all(profileGetCallList);
            if (!ObjectUtils.isEmpty(profileGetResponseList)) {
                profileGetResponseList.forEach(profileResponse => {
                    if (profileResponse && profileResponse.response.status == 'success') {
                        let res = profileResponse.response;
                        if (ObjectUtils.isValidObjectPath(res, 'configObjects.0.data.jsonData.matchRules')) {
                            let matchRules = res.configObjects[0].data.jsonData.matchRules || [];
                            let probabilisticRule = matchRules.find(rule => rule.matchType == 'probabilistic');
                            if (ObjectUtils.isValidObjectPath(probabilisticRule, 'probabilisticSettings.familyRules')) {
                                let familyRules = probabilisticRule.probabilisticSettings.familyRules || [];
                                familyRules = familyRules.filter(rule => !ObjectUtils.isEmpty(rule));
                                let ruleAttributes = familyRules.map(rule => rule.name) || [];
                                familyAttributes = familyAttributes.concat(ruleAttributes);

                                let profileEntityType = (res.configObjects[0].id || '').split('_')[0];
                                let profileSourceAttributes = [];
                                familyRules.forEach((rule, index) => {
                                    if (rule.sourceAttributes) {
                                        profileSourceAttributes.push({
                                            sequence: index + 1,
                                            familyName: rule.name || '',
                                            attributes: rule.sourceAttributes.map(attr => attr.split('/')[0])
                                        });
                                    }
                                });
                                profileSourceAttributes = _.uniq(profileSourceAttributes);
                                familySourceAttributes[profileEntityType] = profileSourceAttributes;
                            }
                        }
                    }
                });
            }
        }
        await this._prepareFamilyNames(); //For external names
        this._familyAttributes = _.uniq(familyAttributes);
        this._familySourceAttributes = familySourceAttributes;
    }

    async _prepareFamilyNames() {
        let familyNames = await ReferenceManager.getReferenceData('rsInternalReferenceDataMatchFamilyName');
        if (!ObjectUtils.isEmpty(familyNames)) {
            familyNames.forEach(item => {
                if (item.data && item.data.attributes) {
                    let code = AttributeUtils.getFirstAttributeValue(item.data.attributes['code']);
                    let externalname = AttributeUtils.getFirstAttributeValue(item.data.attributes['externalname']);
                    if (code && externalname) {
                        this._familyNames[code] = externalname;
                    }
                }
            });
        }
    }

    _getAllRelationshipAttributes(sourceEntityModel) {
        let relationshipAttributes = [];
        let relationships = {};
        let dataContext = ContextUtils.getFirstDataContext(this.contextData);
        if (ObjectUtils.isEmpty(dataContext)) {
            if (ObjectUtils.isValidObjectPath(sourceEntityModel, 'data.relationships')) {
                relationships = sourceEntityModel.data.relationships || {};
            }
        } else {
            if (ObjectUtils.isValidObjectPath(sourceEntityModel, 'data.contexts.0.relationships')) {
                relationships = sourceEntityModel.data.contexts[0].relationships || {};
            }
        }

        for (let relName of Object.keys(relationships)) {
            if (ObjectUtils.isValidObjectPath(relationships[relName], '0.attributes')) {
                let attributes = relationships[relName][0].attributes || {};
                relationshipAttributes = relationshipAttributes.concat(Object.keys(attributes));
            }
        }
        return _.uniq(relationshipAttributes);
    }

    async _getSourceEntity(reviewIndex) {
        let sourceEntityIdTypeMap = this._sourceEntitiesIdTypeMappings[reviewIndex];
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);

        this._hideSourceCreate = false;
        this._contextData = clonedContextData;

        if (
            sourceEntityIdTypeMap &&
            (this.sourceEntityId != sourceEntityIdTypeMap.id || this.sourceEntityType != sourceEntityIdTypeMap.type)
        ) {
            this.sourceEntityId = sourceEntityIdTypeMap.id;
            this.sourceEntityType = sourceEntityIdTypeMap.type;

            // Context selection should happen based on search selection
            if (this._isNextLoad || this.isCompareProcess) {
                this._resetContextSelection();
            }
        }

        await this._setMatchRelationshipNames();

        clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [sourceEntityIdTypeMap];
        this._loading = true;

        await this._fetchEntityAndRelatedEntityModels([
            {
                id: this.sourceEntityId,
                type: this.sourceEntityType
            }
        ]);

        let sourceEntityModel = this._modelList.find(
            model => model.name == this.sourceEntityType && model.entityId == this.sourceEntityId
        );
        if (!ObjectUtils.isEmpty(sourceEntityModel) && sourceEntityModel.data && sourceEntityModel.data.attributes) {
            let sourceEntityAttributes = sourceEntityModel.data.attributes;
            this._sourceExternalAttributeName = Object.keys(sourceEntityAttributes).find(
                key => sourceEntityAttributes[key].properties && sourceEntityAttributes[key].properties.isExternalName
            );
        }
        let isSourceOfWhereusedReq = {};
        if (
            ObjectUtils.isValidObjectPath(
                sourceEntityModel,
                `data.relationships.${this._matchRelationshipNames['issourceof']}.0.properties.relationshipOwnership`
            )
        ) {
            let isSourceOfModel = sourceEntityModel.data.relationships[this._matchRelationshipNames['issourceof']][0];
            isSourceOfModel.type = this._matchRelationshipNames['issourceof'];
            if (isSourceOfModel.properties.relationshipOwnership == 'whereused') {
                isSourceOfWhereusedReq = DataRequestHelper.createEntityGetRequestWithRelationshipCriterion(
                    clonedContextData,
                    isSourceOfModel
                );
            }
        }
        //Relationship reference attribute names from source model
        this._relationshipReferenceAttributeNames = this._getRelationshipReferenceAttributeNames(sourceEntityModel);

        if (ObjectUtils.isEmpty(this._familyAttributes)) {
            await this._setEntityFamilyAttributes();
        }

        let req = DataRequestHelper.createEntityGetRequest(clonedContextData, true);
        req.params.fields.attributes = ['_ALL']; // Todo - Pick from config?
        req.params.fields.relationships = ['_ALL'];
        req.params.fields.relationshipAttributes = this._familyAttributes.concat(
            this._getAllRelationshipAttributes(sourceEntityModel)
        );
        req.params.fields.relatedEntityAttributes = this._getRelatedEntityAttributes();

        let sourceEntityGetReq = DataObjectManager.createRequest('getbyids', req, undefined, {
            objectsCollectionName: 'entities'
        });

        let sourceEntityGetResponse = await DataObjectManager.initiateRequest(sourceEntityGetReq);

        //Capture GRM States for the source
        if (ObjectUtils.isValidObjectPath(sourceEntityGetResponse, 'response.content.entities.0.data.attributes')) {
            let sourceEntity = sourceEntityGetResponse.response.content.entities[0];
            this._setGRMStateAttributes(sourceEntity);
        }

        let sourceEntityWhereusedGetResponse = {};
        if (!ObjectUtils.isEmpty(isSourceOfWhereusedReq)) {
            let sourceEntityWhereusedGetReq = DataObjectManager.createRequest(
                'searchandget',
                isSourceOfWhereusedReq,
                undefined,
                { objectsCollectionName: 'entities' }
            );
            sourceEntityWhereusedGetResponse = await DataObjectManager.initiateRequest(sourceEntityWhereusedGetReq);
        }

        if (
            ObjectUtils.isValidObjectPath(sourceEntityGetResponse, 'response.content.entities') &&
            sourceEntityGetResponse.response.content.entities.length
        ) {
            this._sourceEntityDataProcess(sourceEntityGetResponse, sourceEntityWhereusedGetResponse);
        } else {
            this._handleSourceEntityDataGetFailure(sourceEntityGetResponse);
            return;
        }
    }

    async _getRelationshipReferenceAttributeNames(entityModel) {
        let relationshipReferenceAttributes = [];
        if (entityModel && entityModel.data && entityModel.data.relationships) {
            let relationships = entityModel.data.relationships;
            for (let relName in relationships) {
                let ownedRel = relationships[relName].find(
                    rel => rel.properties && rel.properties.relationshipOwnership == 'owned'
                );
                if (ownedRel && ownedRel.attributes) {
                    //Ref attributes
                    for (let key in ownedRel.attributes) {
                        let relAttr = ownedRel.attributes[key];
                        if (relAttr && relAttr.properties && relAttr.properties.isReferenceType) {
                            relationshipReferenceAttributes.push(key);
                        }
                    }
                }
            }
        }

        return relationshipReferenceAttributes;
    }

    _transformedMatchResponse(entityMatchResponse) {
        if (entityMatchResponse && entityMatchResponse.response) {
            let response = entityMatchResponse.response;
            if (!response || (response.status && response.status.toLowerCase() != 'success')) {
                this._logMatchFailure(entityMatchResponse);
                return;
            }

            //No matches found, create entity along with sync validation
            if (ObjectUtils.isEmpty(response.entities)) {
                return;
            }

            this._transformedSourceEntity = response.entities.find(
                entity => entity.properties && entity.properties.isSource
            );
            response.entities = response.entities.filter(entity => !entity.properties || !entity.properties.isSource);

            let type = 'deterministic';
            if (response.statusDetail) {
                if (response.statusDetail.probabilisticMatch) {
                    type = 'mlbased';
                    this._matchThreshold.create = response.statusDetail.createThreshold || 0;
                    this._matchThreshold.merge = response.statusDetail.mergeThreshold || 100;
                    this._modelVersion = response.statusDetail.modelVersion || '1.0.0';
                }
            }

            //Match process starts
            let matchedEntities = response.entities || [];
            let matchDetails = {
                type: type
            };
            let potentialMatches = [];
            if (type == 'deterministic') {
                let entities = this._prepareEntities(matchedEntities, type);
                matchDetails.duplicateMultiMatch = false;
                if (entities.fullList.length > 1) {
                    matchDetails.duplicateMultiMatch = true;
                }
                potentialMatches = entities.fullList;
            }

            if (type == 'mlbased') {
                this._mlBasedResults = this._prepareEntities(matchedEntities, type);
                if (
                    !this._mlBasedResults.fullList.length ||
                    this._mlBasedResults.fullList.length == this._mlBasedResults.createList.length
                ) {
                    potentialMatches = this._mlBasedResults.fullList;
                } else if (this._mlBasedResults.mergeList.length) {
                    let highestRankedEntity = _.max(this._mlBasedResults.mergeList, function (entity) {
                        return entity.score;
                    });
                    //Find all highest score entities
                    let highestRankedEntityList = this._mlBasedResults.mergeList.filter(entity => {
                        return entity.score == highestRankedEntity.score;
                    });
                    if (highestRankedEntityList.length == 1) {
                        matchDetails.duplicateMultiMatch = false;
                        potentialMatches = highestRankedEntityList;
                    } else {
                        matchDetails.duplicateMultiMatch = true;
                        potentialMatches = this._mlBasedResults.mergeList;
                    }
                } else if (this._mlBasedResults.createOrMergeList.length) {
                    potentialMatches = this._mlBasedResults.createOrMergeList;
                }
            }
            this.matchedEntitiesData = potentialMatches;
            matchDetails.relationships = potentialMatches.map(entity => {
                return {
                    relTo: {
                        id: entity.id,
                        type: entity.type
                    }
                };
            });
            return matchDetails;
        } else {
            this._logMatchFailure(entityMatchResponse);
        }
    }

    _setSourceEntityData(sourceEntity) {
        let sourceEntityIndex = this.sourceEntitiesData.findIndex(
            v => v.entity && v.entity.id == sourceEntity.entity.id
        );
        if (sourceEntityIndex == -1) {
            this.sourceEntitiesData.push(sourceEntity);
        } else {
            sourceEntity.status = this.sourceEntitiesData[sourceEntityIndex].status;
            this.sourceEntitiesData[sourceEntityIndex] = sourceEntity;
        }
    }

    _triggerNotValidForProcess(entity, msg) {
        this._setSourceEntityData({
            entity: entity,
            status: 'pending',
            isValidForProcess: false
        });
        this._showNotValidForProcess(msg);
        this._triggerEventOnSourceChange(entity, true);
    }

    _triggerEventOnSourceChange(sourceEntity, isInvalidProcess = false) {
        if (this._isContextChanged && !this._isNextLoad) {
            return;
        }
        //Event for source title change
        let action = this.aci.createAction({
            name: 'source-entity-changed',
            detail: {
                entity: sourceEntity,
                domain: this.domain || '',
                isInvalidProcess: isInvalidProcess
            }
        });
        this.aci.dispatch(action);
    }

    async _sourceEntityDataProcess(sourceEntityGetResponse, sourceEntityWhereusedGetResponse) {
        if (ObjectUtils.isValidObjectPath(sourceEntityGetResponse, 'response.content.entities')) {
            this._sourceEntityGetResponse = ObjectUtils.cloneObject(sourceEntityGetResponse);
            this._sourceEntityWhereusedGetResponse = ObjectUtils.cloneObject(sourceEntityWhereusedGetResponse);
            let sourceEntities = sourceEntityGetResponse.response.content.entities || [];

            if (sourceEntities) {
                let sourceEntity = sourceEntities[0];
                if (sourceEntity) {
                    if (ObjectUtils.isEmpty(sourceEntity.domain)) {
                        delete sourceEntity.domain;
                    }

                    let isValidForProcess = false;
                    let processType = ''; //owned, whereused
                    let ownedRelationships = [];
                    let whereusedRelationships = [];
                    this._enableFeedbackCollection = false;
                    this._mlBasedResults = [];
                    this._ownedRelationshipLimitExceeded = false;
                    this.showActionButtons = true;
                    this._showNewStateMessage = false;
                    this._isCreateProcessWithNoMatch = false;
                    this._matchMergeInformation = '';
                    if (!this._isTabChangeProcess && this._isInitialDataLoad) {
                        this.allowMergePreview = this._configAllowMergePreview;
                    }

                    if (!this.isCompareProcess) {
                        if (ObjectUtils.isEmpty(this._grmMappingConfig)) {
                            await this._setGRMMappingConfig();
                            if (ObjectUtils.isEmpty(this._grmMappingConfig)) {
                                this._triggerNotValidForProcess(sourceEntity);
                                LoggerManager.logError(this, 'GRM configuration missing');
                                return;
                            }
                        }
                        processType = MatchMergeHelper.getMatchProcessType(this._grmMappingConfig, sourceEntity.type);
                    } else {
                        processType = 'whereused';
                        this.sourceEntitiesData = [];
                        if (
                            ObjectUtils.isValidObjectPath(
                                sourceEntity,
                                `data.relationships.${this._matchRelationshipNames['issourceof']}`
                            )
                        ) {
                            sourceEntity.data.relationships[this._matchRelationshipNames['issourceof']] = [];
                        }
                    }

                    if (!processType) {
                        this._triggerNotValidForProcess(sourceEntity);
                        LoggerManager.logError(
                            this,
                            'Entity type is not available in grm config to execute the process'
                        );
                        return;
                    }

                    // owned relationships
                    if (processType == 'owned') {
                        if (
                            ObjectUtils.isValidObjectPath(
                                sourceEntity,
                                `data.relationships.${this._matchRelationshipNames['potentialmatches']}`
                            )
                        ) {
                            ownedRelationships =
                                sourceEntity.data.relationships[this._matchRelationshipNames['potentialmatches']] || [];
                        }

                        //TODO - Recheck the code
                        if (ObjectUtils.isEmpty(ownedRelationships)) {
                            let entity = ObjectUtils.cloneObject(sourceEntity);
                            entity.type = MatchMergeHelper.getGREntityType(this._grmMappingConfig, sourceEntity.type);
                            let matchResponse = await this._getMatchedEntities(entity);
                            let matchDetails = this._transformedMatchResponse(matchResponse) || {};
                            ownedRelationships = matchDetails.relationships || [];
                        } else {
                            let isScoreAvailable = false;
                            let matchedEntitiesData = [];
                            ownedRelationships.forEach(rel => {
                                let matchRelEntity = {
                                    id: rel.relTo.id,
                                    type: rel.relTo.type,
                                    data: {
                                        attributes: rel.attributes ? rel.attributes : {}
                                    },
                                    formattedAttributes: {}
                                };
                                if (rel.attributes) {
                                    for (let attributeName in rel.attributes) {
                                        let attributeValue = AttributeUtils.getFirstAttributeValue(
                                            rel.attributes[attributeName]
                                        );
                                        if (attributeName == 'score') {
                                            matchRelEntity.score = attributeValue;
                                            isScoreAvailable = true;
                                        }
                                        matchRelEntity.formattedAttributes[attributeName] = attributeValue;
                                    }
                                }
                                matchedEntitiesData.push(matchRelEntity);
                            });
                            this.matchedEntitiesData = matchedEntitiesData;

                            if (isScoreAvailable) {
                                this._mlBasedResults = {
                                    createOrMergeList: this.matchedEntitiesData,
                                    matchedEntitiesData: this.matchedEntitiesData,
                                    fullList: this.matchedEntitiesData
                                };
                            }
                        }

                        this._isSourceOfRelationship = {};
                        if (
                            ObjectUtils.isValidObjectPath(
                                sourceEntity,
                                `data.relationships.${this._matchRelationshipNames['issourceof']}`
                            )
                        ) {
                            this._isSourceOfRelationship =
                                sourceEntity.data.relationships[this._matchRelationshipNames['issourceof']][0];
                        }

                        if (!this._potentialMatchesFlagChangeTriggered && !this._isTabChangeProcess) {
                            this.selectPotentialMatches = this._configSelectPotentialMatches;
                        }
                        this._potentialMatchesFlagChangeTriggered = false; //Reset
                        if (ObjectUtils.isEmpty(this._isSourceOfRelationship)) {
                            this.selectPotentialMatches = !ObjectUtils.isEmpty(ownedRelationships);
                        }

                        if (!this.selectPotentialMatches) {
                            ownedRelationships = [];
                        }

                        this._enableFeedbackCollection =
                            this.selectPotentialMatches &&
                            !ObjectUtils.isEmpty(ownedRelationships) &&
                            !ObjectUtils.isEmpty(this._mlBasedResults);

                        if (!ObjectUtils.isEmpty(this._isSourceOfRelationship)) {
                            let foundSourceRel = ownedRelationships.find(
                                rel => rel.relTo.id == this._isSourceOfRelationship.relTo.id
                            );
                            if (ObjectUtils.isEmpty(foundSourceRel)) {
                                ownedRelationships.push(this._isSourceOfRelationship);
                            }
                        }
                    }

                    // Whereused relationships
                    if (processType == 'whereused') {
                        if (this.isCompareProcess) {
                            whereusedRelationships = (this._compareEntities || []).filter(
                                entity => entity.id != sourceEntity.id
                            );
                        } else if (
                            ObjectUtils.isValidObjectPath(sourceEntityWhereusedGetResponse, 'response.content.entities')
                        ) {
                            whereusedRelationships = sourceEntityWhereusedGetResponse.response.content.entities;
                        }
                        this.allowMergePreview = false;
                    }

                    //When limit exceeded, show message
                    if (
                        (ownedRelationships.length > this.matchEntitiesLimit ||
                            whereusedRelationships.length > this.matchEntitiesLimit) &&
                        !this._ignoreLimitCheck()
                    ) {
                        this._ownedRelationshipLimitExceeded = ownedRelationships.length > this.matchEntitiesLimit;
                        ownedRelationships = [];
                        whereusedRelationships = [];
                        this._isMaxLimitExceedMessage = true;
                        this._triggerNotValidForProcess(
                            sourceEntity,
                            this.localize('EntMerLmtVldMsg', {
                                matchEntitiesLimit: this.matchEntitiesLimit
                            })
                        );
                        return;
                    }

                    if (!ObjectUtils.isEmpty(this._tabularViewSelectedEntities)) {
                        ownedRelationships = ownedRelationships.filter(
                            rel => rel.relTo && this._tabularViewSelectedEntities.includes(rel.relTo.id)
                        );
                        whereusedRelationships = whereusedRelationships.filter(
                            rel => rel.relTo && this._tabularViewSelectedEntities.includes(rel.relTo.id)
                        );
                    }

                    if (!ObjectUtils.isEmpty(ownedRelationships) || !ObjectUtils.isEmpty(whereusedRelationships)) {
                        if (processType != 'whereused') {
                            let showNewStateMessage = false;
                            if (ObjectUtils.isValidObjectPath(sourceEntity, 'data.attributes')) {
                                let attributes = sourceEntity.data.attributes;
                                let grmState = AttributeUtils.getFirstAttributeValue(
                                    attributes[this._grmAttributeNames.grmState]
                                );
                                let grmProcessState = AttributeUtils.getFirstAttributeValue(
                                    attributes[this._grmAttributeNames.grmProcessState]
                                );
                                if (this.isGRMV2Flow && (!grmState || grmState == 'New' || grmState == 'Update')) {
                                    showNewStateMessage = true;
                                }
                                if (grmProcessState == 'Discarded') {
                                    this.showActionButtons = false;
                                }
                            }
                            this._showNewStateMessage = showNewStateMessage;
                            if (this._showNewStateMessage && !this._ignoreShowNewStateMessage) {
                                this._triggerNotValidForProcess(sourceEntity, this.localize('MatMerNewStaMsg'));
                                return;
                            }
                        }
                        isValidForProcess = true;
                    } else {
                        //When no matches found then trigger create process when owned
                        if (processType == 'owned') {
                            isValidForProcess = true;
                            this._isCreateProcessWithNoMatch = true;
                            sourceEntity.isRep = true;
                            this._matchMergeInformation = this.localize('MatMerNoMatFouMsg');
                        } else {
                            this._triggerNotValidForProcess(sourceEntity, this.localize('MatMerNoMatFouMsg'));
                            return;
                        }
                    }

                    if (isValidForProcess) {
                        this._triggerEventOnSourceChange(sourceEntity);
                    }

                    if (
                        this._sourceExternalAttributeName &&
                        ObjectUtils.isValidObjectPath(
                            sourceEntity,
                            `data.attributes.${this._sourceExternalAttributeName}`
                        )
                    ) {
                        let externalAttributeValue = AttributeUtils.getFirstAttributeValue(
                            sourceEntity.data.attributes[this._sourceExternalAttributeName]
                        );
                        sourceEntity.name = externalAttributeValue || '';
                    }

                    if (sourceEntity.name instanceof Object) {
                        sourceEntity.name = '';
                    }

                    sourceEntity = {
                        entity: sourceEntity,
                        status: 'pending',
                        isValidForProcess: isValidForProcess,
                        processType: processType,
                        relationships:
                            processType == 'owned'
                                ? ownedRelationships
                                : processType == 'whereused'
                                ? whereusedRelationships
                                : []
                    };
                    this._setSourceEntityData(sourceEntity);
                    this.sourceEntity = undefined;
                    this.sourceEntity = sourceEntity.entity;
                }
            }
        } else {
            this._loading = false;
            LoggerManager.logError(this, 'Entities data missing: ', sourceEntityGetResponse);
        }
    }

    _ignoreLimitCheck() {
        return (
            this._selectedView == 'tabular' ||
            (!ObjectUtils.isEmpty(this._tabularViewSelectedEntities) &&
                this._tabularViewSelectedEntities.length <= this.matchEntitiesLimit)
        );
    }

    _handleSourceEntityDataGetFailure(sourceEntityGetResponse) {
        let entityId = this.localize('EntTxt');
        if (ObjectUtils.isValidObjectPath(sourceEntityGetResponse, 'request.requestData.params.query.id')) {
            entityId = sourceEntityGetResponse.request.requestData.params.query.id;
        }

        let sourceEntity = {
            entity: {
                id: entityId,
                name: entityId
            },
            status: 'pending',
            isValidForProcess: false
        };

        this.sourceEntitiesData.push(sourceEntity);
        this.sourceEntity = undefined; //reset current entity
        this._reset();
        this._showNotValidForProcess();
        LoggerManager.logError(this, 'Entity get failed: ', sourceEntityGetResponse);
    }

    async _setMatchRelationshipNames() {
        //Reset
        this._matchRelationshipNames = {
            issourceof: 'issourceof',
            potentialmatches: 'potentialmatches'
        };
        if (ObjectUtils.isEmpty(this._grmMappingConfig)) {
            await this._setGRMMappingConfig();
        }
        if (!ObjectUtils.isEmpty(this._grmMappingConfig)) {
            if (this._grmMappingConfig[this.sourceEntityType]) {
                let goldenRecordRelName = MatchMergeHelper.getGoldenRecordRelName(
                    this._grmMappingConfig[this.sourceEntityType]
                );
                if (!ObjectUtils.isEmpty(goldenRecordRelName)) {
                    this._matchRelationshipNames.issourceof = goldenRecordRelName;
                }
                let potentialMatchesRelName = MatchMergeHelper.getPotentialMatchesRelName(
                    this._grmMappingConfig[this.sourceEntityType]
                );
                if (!ObjectUtils.isEmpty(potentialMatchesRelName)) {
                    this._matchRelationshipNames.potentialmatches = potentialMatchesRelName;
                }
            }
        }
    }

    async _onSourceEntityChange() {
        if (!ObjectUtils.isEmpty(this.sourceEntity)) {
            await this._setDeterministicMatchAttributes();
            let isValidForProcess = true;
            let sourceEntityData = {};
            if (!ObjectUtils.isEmpty(this.sourceEntitiesData)) {
                sourceEntityData = this.sourceEntitiesData.find(v => v.entity && v.entity.id == this.sourceEntity.id);
                if (sourceEntityData) {
                    isValidForProcess = sourceEntityData.isValidForProcess;
                }
            }
            this._reset();
            if (isValidForProcess) {
                this._loading = true;
                this._isRelationshipProcess =
                    !ObjectUtils.isEmpty(sourceEntityData) && !ObjectUtils.isEmpty(sourceEntityData.relationships);
                if (!ObjectUtils.isEmpty(sourceEntityData)) {
                    this._isOwnedProcess = sourceEntityData.processType == 'owned';
                    this._isWhereusedProcess = sourceEntityData.processType == 'whereused';
                }
                setTimeout(() => {
                    this._triggerEntityModelGet();
                }, 50);
            } else {
                this._showNotValidForProcess();
            }
        }
    }

    async _fetchEntityAndRelatedEntityModels(modelGetEntityList) {
        let validModelGetEntityList = [];

        if (this._isContextChanged || ObjectUtils.isEmpty(this._modelList)) {
            validModelGetEntityList = modelGetEntityList;
        } else {
            for (let entity of modelGetEntityList) {
                if (!this._modelList.find(model => model.name == entity.type && model.entityId == entity.id)) {
                    validModelGetEntityList.push(entity);
                }
            }
        }

        if (ObjectUtils.isEmpty(validModelGetEntityList)) {
            return;
        }

        let modelGetCallList = [];
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        for (let entity of validModelGetEntityList) {
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [entity];
            modelGetCallList.push(this._getCompositeModel(clonedContextData));
        }

        if (!ObjectUtils.isEmpty(modelGetCallList)) {
            //Entity models
            let modelGetResponseList = await Promise.all(modelGetCallList);
            modelGetResponseList = modelGetResponseList.filter(modelObj => modelObj);
            // Related entity type collection as per model relationships
            let relatedEntityTypes = [];
            if (!ObjectUtils.isEmpty(modelGetResponseList)) {
                //Set entity for models
                validModelGetEntityList.forEach((entity, index) => {
                    modelGetResponseList[index].entityId = entity.id;
                });

                if (ObjectUtils.isEmpty(this._modelList)) {
                    this._modelList = [].concat(modelGetResponseList);
                } else {
                    for (let modelResponse of modelGetResponseList) {
                        let findIndex = this._modelList.findIndex(
                            model => model.name == modelResponse.name && model.entityId == modelResponse.entityId
                        );
                        if (findIndex == -1) {
                            this._modelList.push(modelResponse);
                        } else {
                            this._modelList[findIndex] = modelResponse;
                        }
                    }
                }

                //Relationship entity model details are needed for comparision grids (Eg: 1 same, 2 unique)
                for (let entityModel of modelGetResponseList) {
                    if (entityModel && entityModel.data && entityModel.data.relationships) {
                        if (this.sourceEntityId != entityModel.entityId) {
                            continue;
                        }
                        let relationships = entityModel.data.relationships;
                        for (let relationshipName in relationships) {
                            for (let relByType of relationships[relationshipName]) {
                                if (relByType.properties && relByType.properties.relatedEntityInfo) {
                                    for (let relatedEntityInfo of relByType.properties.relatedEntityInfo) {
                                        if (!relatedEntityTypes.find(type => type == relatedEntityInfo.relEntityType)) {
                                            relatedEntityTypes.push(relatedEntityInfo.relEntityType);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            let relatedEntityTypeList = relatedEntityTypes.filter(
                type => !this._modelList.find(model => model.name == type)
            );
            if (!ObjectUtils.isEmpty(relatedEntityTypeList)) {
                modelGetCallList = [];
                for (let type of relatedEntityTypeList) {
                    clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [{ type: type }];
                    modelGetCallList.push(this._getCompositeModel(clonedContextData));
                }
                modelGetResponseList = await Promise.all(modelGetCallList);
                if (!ObjectUtils.isEmpty(modelGetResponseList)) {
                    modelGetResponseList = modelGetResponseList.filter(modelObj => modelObj);
                    this._modelList = this._modelList.concat(modelGetResponseList);
                }
            }
        }
    }

    async _triggerEntityModelGet() {
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);

        if (this.isCreateProcess && ObjectUtils.isEmpty(this.sourceEntitiesData)) {
            clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [
                { id: this.sourceEntityId, type: this.sourceEntityType }
            ];
            await this._fetchEntityAndRelatedEntityModels([
                {
                    id: this.sourceEntityId,
                    type: this.sourceEntityType
                }
            ]);
        }

        //Match entities
        let currentSourceEntity = !ObjectUtils.isEmpty(this.sourceEntitiesData)
            ? this.sourceEntitiesData[this.reviewIndex]
            : {};
        let modelGetEntityList = [];
        if (!ObjectUtils.isEmpty(currentSourceEntity.relationships)) {
            for (let relationship of currentSourceEntity.relationships) {
                let relEntity = relationship.relTo ? relationship.relTo : relationship;
                modelGetEntityList.push(relEntity);
            }
        }
        if (
            this.isCreateProcess &&
            ObjectUtils.isEmpty(modelGetEntityList) &&
            ObjectUtils.isValidObjectPath(this.processDetails, 'matchResponse.response.entities')
        ) {
            modelGetEntityList = this.processDetails.matchResponse.response.entities;
        }
        if (!ObjectUtils.isEmpty(modelGetEntityList)) {
            await this._fetchEntityAndRelatedEntityModels(modelGetEntityList);
        }

        let entityModel = this._modelList.find(
            model => model.name == this.sourceEntityType && model.entityId == this.sourceEntityId
        );
        let firstDataContext = ContextUtils.getFirstDataContext(clonedContextData);
        this._isModelAvailable = true;

        if (!ObjectUtils.isEmpty(entityModel)) {
            entityModel = ObjectUtils.cloneObject(entityModel); //Should not effect modelList
            if (!ObjectUtils.isEmpty(firstDataContext)) {
                let contextualData =
                    entityModel.data && entityModel.data.contexts ? entityModel.data.contexts[0] : undefined;

                if (ObjectUtils.isEmpty(contextualData)) {
                    this._isModelAvailable = false;
                }
            }

            if (this._isModelAvailable) {
                this._entityModels.push(entityModel);
                this._attributeModels = DataTransformHelper.transformAttributeModels(
                    this._entityModels[0],
                    this.contextData,
                    undefined,
                    true,
                    true
                );
                this._relationshipModels = DataTransformHelper.transformRelationshipModels(
                    this._entityModels[0],
                    this.contextData,
                    undefined,
                    true
                );

                //issourceof, potentialmatches are not eligible for rel merge
                if (this._relationshipModels) {
                    delete this._relationshipModels[this._matchRelationshipNames['issourceof']];
                    delete this._relationshipModels[this._matchRelationshipNames['potentialmatches']];
                }
                if (this._attributeModels) {
                    //GRM state attributes are not eligible for attr merge
                    delete this._attributeModels[this._grmAttributeNames.grmState];
                    delete this._attributeModels[this._grmAttributeNames.grmProcessState];

                    //Deeply Nested attributes not supported now
                    let deeplyNestedAttributes = Object.keys(this._attributeModels).filter(
                        modelKey => this._attributeModels[modelKey].dataType == 'deeplynested'
                    );
                    if (!ObjectUtils.isEmpty(deeplyNestedAttributes)) {
                        deeplyNestedAttributes.forEach(attrName => {
                            delete this._attributeModels[attrName];
                        });
                    }
                }
                //Consider the relmodels which have "owned"
                if (!ObjectUtils.isEmpty(this._relationshipModels)) {
                    let allowedRelModels = {};
                    for (let key in this._relationshipModels) {
                        let foundOwnedRelModel = this._relationshipModels[key].find(
                            relModel => relModel.properties && relModel.properties.relationshipOwnership == 'owned'
                        );
                        if (foundOwnedRelModel) {
                            allowedRelModels[key] = this._relationshipModels[key];
                        }
                    }
                    this._relationshipModels = allowedRelModels;
                }

                if (!ObjectUtils.isEmpty(entityModel.properties)) {
                    this._matchPermissions.submitPermission =
                        typeof entityModel.properties.submitPermission === 'boolean'
                            ? entityModel.properties.submitPermission
                            : this._matchPermissions.submitPermission;
                    this._matchPermissions.mergePermission =
                        typeof entityModel.properties.mergePermission === 'boolean'
                            ? entityModel.properties.mergePermission
                            : this._matchPermissions.mergePermission;
                }
            } else {
                this._loading = false;
                if (ObjectUtils.isEmpty(this._attributeModels) && ObjectUtils.isEmpty(this._relationshipModels)) {
                    this.hideDataFilter = true;
                }
            }

            this._mergeReviewValidition = {
                attributeDeniedPermission: ObjectUtils.isEmpty(this._attributeModels),
                relationshipDeniedPermission: ObjectUtils.isEmpty(this._relationshipModels)
            };

            this._triggerEntityMatch();
            this._triggerHideShowContainer();
        }
    }

    _triggerHideShowContainer() {
        this._hideShowContainer(!this._isModelAvailable || ObjectUtils.isEmpty(this._attributeModels), true);
        this._hideShowContainer(!this._isModelAvailable || ObjectUtils.isEmpty(this._relationshipModels), false);
    }

    _hideShowContainer(isHidden, isAttribute) {
        let currentActiveComponent = this._getCurrentActiveComponent();

        if (!currentActiveComponent) {
            return;
        }

        if (isAttribute) {
            this._showAttributePermissionDeniedMessage = isHidden;
        } else {
            this._showRelationshipPermissionDeniedMessage = isHidden;
        }

        currentActiveComponent.mergeReviewValidition = {
            attributeDeniedPermission: this._showAttributePermissionDeniedMessage,
            relationshipDeniedPermission: this._showRelationshipPermissionDeniedMessage
        };
    }

    _getItemNames(isAttributes = true) {
        let key = isAttributes ? 'attributes' : 'relationships';
        let items = [];
        let viewSettings = this.isCompareProcess
            ? this.viewSettings['compare']
            : this._selectedView == 'tabular'
            ? this.viewSettings['tabular']
            : this.viewSettings;
        if (viewSettings && !ObjectUtils.isEmpty(viewSettings[key])) {
            Object.keys(viewSettings[key]).forEach(prop => {
                items.push(viewSettings[key][prop].name || prop);
            });
            items = items.concat(['grmstate', 'grmprocessstate']); //Need grm attributes irrespective of view settings
        } else {
            items.push('_ALL');
        }
        return _.uniq(items);
    }

    async _getCompositeModel(contextData) {
        let compositeModel = {};
        let request = DataRequestHelper.createEntityModelCompositeGetRequest(contextData);
        let allowedAttributes = [];
        let itemContext = ContextUtils.getFirstItemContext(contextData);
        let isSourceEntity = itemContext && itemContext.type == this.sourceEntityType;

        if (this.showAttributes) {
            allowedAttributes = this._getItemNames();

            if (this._selectedView == 'tabular' && allowedAttributes.includes('_ALL')) {
                allowedAttributes = ObjectUtils.isEmpty(this._sourceAllowedAttributes)
                    ? ['grmstate', 'grmprocessstate']
                    : this._sourceAllowedAttributes;
                request.params.fields.attributes = isSourceEntity ? ['_ALL'] : allowedAttributes;
            } else {
                request.params.fields.attributes = allowedAttributes;
            }
        }
        if (this.showRelationships) {
            request.params.fields.relationships = this._getItemNames(false);
            request.params.fields.relationshipAttributes = ['_ALL'];
        }

        //Add default relationship
        if (!request.params.fields.relationships) {
            request.params.fields.relationships = [];
        }
        let relationships = request.params.fields.relationships;
        if (
            relationships.indexOf('_ALL') == -1 &&
            relationships.indexOf(this._matchRelationshipNames['issourceof']) == -1
        ) {
            relationships.push(this._matchRelationshipNames['issourceof']);
        }
        if (
            relationships.indexOf('_ALL') == -1 &&
            relationships.indexOf(this._matchRelationshipNames['potentialmatches']) == -1
        ) {
            relationships.push(this._matchRelationshipNames['potentialmatches']);
        }

        if (request) {
            compositeModel = await EntityCompositeModelManager.getCompositeModel(request, contextData, true);
        }

        if (!compositeModel || !compositeModel.data) {
            this._handleCompositeModelGetError(compositeModel);
        } else {
            //Reset model based on allowed details
            if (isSourceEntity && this._selectedView == 'tabular') {
                this._setSourceModelAttributes(compositeModel, contextData, allowedAttributes);
            }
            return compositeModel;
        }
    }

    _setSourceModelAttributes(compositeModel, contextData, allowedAttributes) {
        let dataContext = ContextUtils.getFirstDataContext(contextData);
        if (!allowedAttributes.includes('_ALL')) {
            let modelAttributes = {};
            if (!ObjectUtils.isEmpty(dataContext)) {
                if (ObjectUtils.isValidObjectPath(compositeModel, 'data.contexts.0.attributes')) {
                    modelAttributes = compositeModel.data.contexts[0].attributes;
                }
            } else {
                if (ObjectUtils.isValidObjectPath(compositeModel, 'data.attributes')) {
                    modelAttributes = compositeModel.data.attributes;
                }
            }

            let allowedModelAttributes = {};
            allowedAttributes.forEach(allowedAttribute => {
                if (modelAttributes[allowedAttribute]) {
                    allowedModelAttributes[allowedAttribute] = modelAttributes[allowedAttribute];
                }
            });

            if (
                !Object.keys(allowedModelAttributes || []).find(
                    attr => !Object.values(this._grmAttributeNames).includes(attr)
                )
            ) {
                let externalAttributeName = DataHelper.getExternalNameAttributeFromModel(compositeModel);
                allowedModelAttributes[externalAttributeName] = modelAttributes[externalAttributeName];
            }

            if (!ObjectUtils.isEmpty(dataContext)) {
                compositeModel.data.contexts[0].attributes = allowedModelAttributes;
            } else {
                compositeModel.data.attributes = allowedModelAttributes;
            }
            this._sourceAllowedAttributes = Object.keys(allowedModelAttributes);
        }
    }

    _handleCompositeModelGetError(compositeModel) {
        this._loading = false;
        LoggerManager.logError(this, 'Composite model get exception', compositeModel);
    }

    async _triggerEntityMatch() {
        let entityMatchResponse = '';
        if (this.isCreateProcess) {
            entityMatchResponse = this.processDetails.matchResponse;
        } else if (this._isRelationshipProcess) {
            let sourceEntityData = this.sourceEntitiesData.find(v => v.entity && v.entity.id == this.sourceEntity.id);
            if (sourceEntityData) {
                let entities = this._isWhereusedProcess
                    ? sourceEntityData.relationships
                    : sourceEntityData.relationships.map(rel => rel.relTo);
                this._showMatchedEntitiesPerPermissions(entities);
            }
            return;
        } else {
            entityMatchResponse = await this._getMatchedEntities(this.sourceEntity);
        }
        this._handleMatchSuccess(entityMatchResponse);
    }

    async _getMatchedEntities(sourceEntity) {
        let req = {
            entity: sourceEntity,
            params: {
                matchReview: true
            }
        };

        if (!ObjectUtils.isEmpty(this.matchMergeThreshold)) {
            req.params.matchThreshold = this.matchMergeThreshold;
        }

        if (ObjectUtils.isEmpty(req.entity.version)) {
            delete req.entity.version;
        }

        let entityMatchResponse = await this._fetchDetails(req, '/data/pass-through/matchservice/search');
        return entityMatchResponse;
    }

    async _fetchDetails(request, url) {
        let headers = {
            'Content-Type': 'application/json'
        };

        const csrfToken = DALCommonUtils.getCsrfToken();
        if (csrfToken) {
            headers['x-rdp-ct'] = csrfToken;
        }

        let response = await fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(request)
        });
        return await response.json();
    }

    async _handleMatchSuccess(entityMatchResponse) {
        if (entityMatchResponse && entityMatchResponse.response) {
            let response = entityMatchResponse.response;
            if (!response || (response.status && response.status.toLowerCase() != 'success')) {
                this._logMatchFailure(entityMatchResponse);
                return;
            }

            //No matches found, create entity along with sync validation
            if (ObjectUtils.isEmpty(response.entities)) {
                this._showMatchedEntitiesPerPermissions();
                return;
            }

            this._transformedSourceEntity = response.entities.find(
                entity => entity.properties && entity.properties.isSource
            );
            response.entities = response.entities.filter(entity => !entity.properties || !entity.properties.isSource);

            if (this.viewMode == 'mergereview') {
                if (response.entities.length > this.matchEntitiesLimit && !this._ignoreLimitCheck()) {
                    this._loading = false;
                    this._showMessageOnly = true;
                    this._isMaxLimitExceedMessage = true;
                    this._matchProcessMessage = this.localize('EntMerLmtVldMsg', {
                        matchEntitiesLimit: this.matchEntitiesLimit
                    });
                    return;
                }

                let type = 'deterministic';
                if (response.statusDetail) {
                    if (response.statusDetail.probabilisticMatch) {
                        type = 'mlbased';
                        this._matchThreshold.create = response.statusDetail.createThreshold || 0;
                        this._matchThreshold.merge = response.statusDetail.mergeThreshold || 100;
                        this._modelVersion = response.statusDetail.modelVersion || '1.0.0';
                    }
                }

                //Match process starts
                let matchedEntities = ObjectUtils.cloneObject(response.entities) || [];
                this.matchType = type;

                if (!ObjectUtils.isEmpty(this._tabularViewSelectedEntities)) {
                    matchedEntities = matchedEntities.filter(entity =>
                        this._tabularViewSelectedEntities.includes(entity.id)
                    );
                }

                if (type == 'deterministic') {
                    let entities = this._prepareEntities(matchedEntities, type);
                    if (entities.fullList.length == 1) {
                        this._showMatchedEntitiesPerPermissions(entities.fullList);
                        return;
                    } else {
                        this._showDiscard = this.isCreateProcess;
                        this._showMatchedEntitiesPerPermissions(entities.fullList);
                    }
                }

                if (type == 'mlbased') {
                    this._mlBasedResults = this._prepareEntities(matchedEntities, type);
                    if (
                        !this._mlBasedResults.fullList.length ||
                        this._mlBasedResults.fullList.length == this._mlBasedResults.createList.length
                    ) {
                        this._showMatchedEntitiesPerPermissions();
                    } else if (this._mlBasedResults.mergeList.length) {
                        let highestRankedEntity = _.max(this._mlBasedResults.mergeList, function (entity) {
                            return entity.score;
                        });
                        //Find all highest score entities
                        let highestRankedEntityList = this._mlBasedResults.mergeList.filter(entity => {
                            return entity.score == highestRankedEntity.score;
                        });
                        if (highestRankedEntityList.length == 1) {
                            this._showMatchedEntitiesPerPermissions(highestRankedEntityList);
                        } else {
                            this._showDiscard = this.isCreateProcess;
                            this._showMatchedEntitiesPerPermissions(this._mlBasedResults.mergeList);
                        }
                    } else if (this._mlBasedResults.createOrMergeList.length) {
                        this._showMatchedEntitiesPerPermissions(this._mlBasedResults.createOrMergeList);
                    }
                }
            } else if (this.viewMode == 'recommendation') {
                await this._updateMissingAttributeModels();
                let columns = this._prepareRecommendationViewColumns();
                let data = await this._recommendationViewDataGet(response.entities);

                //This scenario raises when user do not have permission to get entity data
                if (!ObjectUtils.isEmpty(response.entities) && ObjectUtils.isEmpty(data)) {
                    //Hide recomendation view and show the first entity
                    let matchedEntity = response.entities[0];
                    this._matchedEntity = {
                        id: matchedEntity.id || '',
                        name: matchedEntity.name || '',
                        type: matchedEntity.type ? this._getExternalEntityType(matchedEntity.type) : ''
                    };
                    this._hasReadPermission = false;
                } else if (data) {
                    let formattedData = await this._getFormattedData(data, columns);

                    this._gridColumns = columns;
                    this._gridData = formattedData;
                }

                if (this.matchType == 'mlbased') {
                    this._mlBasedResults = this._prepareEntities(this.matchedEntitiesData, this.matchType);
                }

                this._loading = false;
            }
        } else {
            this._logMatchFailure(entityMatchResponse);
        }
    }

    _logMatchFailure(detail) {
        this._loading = false;
        this._showMessageOnly = true;
        this._matchProcessMessage = this.isBulkProcess
            ? this.localize('ShoMatEntFaiMulMsg')
            : this.localize('ShoMatEntFaiSinMsg');
        LoggerManager.logError(this, 'MatchSearchRequestFail', JSON.stringify(detail));
    }

    _prepareRecommendationViewColumns() {
        if (this.recommendationGridConfig) {
            DataHelper.updateConfigTitles(
                this.recommendationGridConfig.itemConfig.fields,
                this._attributeModels,
                'header',
                'name'
            );
            let itemConfig = this.recommendationGridConfig.itemConfig;
            let columns = [];
            let fields = itemConfig ? itemConfig.fields : undefined;
            let defaultSort = itemConfig && itemConfig.sort ? itemConfig.sort.default : undefined;

            if (fields) {
                for (let fieldKey in fields) {
                    let field = fields[fieldKey];
                    if (field && field.name) {
                        let column = {
                            headerName: field.header,
                            field: field.name,
                            tooltipField: field.iconColumn ? '' : field.name,
                            headerTooltip: field.header,
                            isMetaDataColumn: field.isMetaDataColumn,
                            sortable: field.sortable,
                            width: field.width,
                            icon: field.icon,
                            name: field.name,
                            iconTooltip: field.iconTooltip,
                            filterable: field.filterable,
                            displaySequence: field.displaySequence,
                            displayType: field.displayType,
                            iconColumn: field.iconColumn,
                            linkTemplate: field.linkTemplate
                        };

                        if (!ObjectUtils.isEmpty(defaultSort)) {
                            let sortOption = defaultSort.find(v => v.field == field.name);
                            if (!ObjectUtils.isEmpty(sortOption)) {
                                column.sort = sortOption.sortType;
                            }
                        }

                        if (field.displayType == 'image') {
                            column.width = 80;
                            column.maxWidth = 80;
                            column.minWidth = 80;
                            column.fixedColumnWidth = true;
                            column.suppressSizeToFit = true;
                            column.cellRenderer = 'bedrockAssetViewer';
                            column.cellRendererParams = params => {
                                let rendererParams = {};

                                if (params.data) {
                                    let cellValue = this._getColumnValue(params);
                                    let assetDetails = this._getAssetDetails(params);
                                    rendererParams.defaultTitle = EntityTypeManager.getTypeExternalNameById('image');
                                    rendererParams.sizing = 'contain';
                                    rendererParams.previewAssetAttribute = this._previewAssetAttribute;
                                    rendererParams.originalAssetAttribute = this._originalAssetAttribute;
                                    rendererParams.src = cellValue;
                                    rendererParams.assetDetails = assetDetails;
                                    rendererParams.assetDataSource = new AssetDataSourceProviderManager(
                                        this._originalAssetAttribute,
                                        assetDetails[this._originalAssetAttribute],
                                        this._previewAssetAttribute,
                                        assetDetails[this._previewAssetAttribute]
                                    );
                                }

                                return rendererParams;
                            };
                        }

                        columns.push(column);
                    }
                }
                if (columns) {
                    columns = _.sortBy(columns, function (item) {
                        return item.displaySequence;
                    });
                }
            }

            return columns;
        }
    }

    async _recommendationViewDataGet(entitiesInfo) {
        let entities;

        this.matchedEntityIds = entitiesInfo.map(entity => entity.id);
        this.matchedEntityTypes = _.uniq(entitiesInfo.map(entity => entity.type));
        this.matchedEntitiesData = entitiesInfo;

        this._prepareContext();

        let firstItemContext =
            this._contextData[ContextUtils.CONTEXT_TYPE_ITEM] &&
            this._contextData[ContextUtils.CONTEXT_TYPE_ITEM].length
                ? this._contextData[ContextUtils.CONTEXT_TYPE_ITEM][0]
                : undefined;
        if (firstItemContext) {
            firstItemContext.type = this.matchedEntityTypes || [];
        }

        let req = DataRequestHelper.createEntityGetRequest(this._contextData, true);
        this._contexts = ContextUtils.getDataContexts(this.contextData);

        req.params.fields.attributes = !ObjectUtils.isEmpty(this._attributeModels)
            ? Object.keys(this._attributeModels)
            : ['_ALL'];

        let matchedEntityGetReq = DataObjectManager.createRequest('getbyids', req, undefined, {
            objectsCollectionName: 'entities'
        });
        let matchedEntityGetResponse = await DataObjectManager.initiateRequest(matchedEntityGetReq);

        if (
            !matchedEntityGetResponse ||
            !matchedEntityGetResponse.response ||
            matchedEntityGetResponse.response.status != 'success'
        ) {
            this._handleMatchedEntityDataGetFailure(matchedEntityGetResponse);
            return;
        }

        if (ObjectUtils.isValidObjectPath(matchedEntityGetResponse, 'response.content.entities')) {
            entities = matchedEntityGetResponse.response.content.entities;
        }

        return entities;
    }

    async _getFormattedData(data, columns) {
        let formattedEntities = [];
        let thumbnailIdFound = false;
        if (data && data.length) {
            formattedEntities = await DataTransformHelper.transformEntitiesToGridFormat(
                data,
                this._attributeModels,
                this._contextData,
                columns
            );
            for (let i = 0; i < formattedEntities.length; i++) {
                let imageObj = EntityUtils.getEntityImageObject(
                    formattedEntities[i],
                    this._previewAssetAttribute,
                    this.contextData
                );
                if (!ObjectUtils.isEmpty(imageObj)) {
                    if (imageObj.value) {
                        thumbnailIdFound = true;
                        break;
                    }
                }
            }
        } else {
            this.isGridDataEmpty = true;
            this.gridInfo = this.localize('NoResMsg');
        }

        if (thumbnailIdFound) {
            await BinaryStreamObjectManager.populatePreviewAssetUrlForEntities(
                formattedEntities,
                this._previewAssetAttribute,
                this._contextData
            );
        }

        return this._transformData(columns, formattedEntities, this._attributeModels);
    }

    _transformData(columns, entities, attrModels) {
        let data = [];

        if (columns) {
            for (let entity of entities) {
                let attributes = entity.attributes;
                let properties = entity.properties;
                let ownershipPermission = true;

                if (
                    entity.properties &&
                    ObjectUtils.isValidObjectPath(entity.properties, 'writePermission') &&
                    entity.properties.writePermission === false
                ) {
                    ownershipPermission = false;
                }

                if (attributes) {
                    let rowData = {};

                    rowData.id = entity.id;
                    rowData.type = entity.type;
                    rowData.typeExternalName = entity.typeExternalName;
                    rowData.name = entity.name;

                    let rowDef = {};
                    for (let column of columns) {
                        let colId = column.field;

                        if (ObjectUtils.isEmpty(rowData[colId]) && column.isMetaDataColumn) {
                            rowData[colId] = properties[colId] ? properties[colId] : '';
                        } else {
                            rowData[colId] = attributes[colId] ? attributes[colId].value : '';
                        }

                        if (ObjectUtils.isEmpty(rowData[colId]) && column.iconColumn) {
                            rowData[colId] = entity[colId];
                        }

                        if (attributes[colId] && attributes[colId].uom) {
                            rowData[`${colId}_uom`] = attributes[colId].uom;
                        }

                        let attrModel = attrModels[colId];

                        if (attrModel) {
                            rowDef[colId] = {
                                editable: ownershipPermission ? attrModel.hasWritePermission : ownershipPermission
                            };
                        }

                        //Format datetime and uom values
                        rowData[colId] = DataTransformHelper.getFormattedAttributeValue(
                            rowData[colId],
                            rowData[`${colId}_uom`],
                            attrModel
                        );
                    }

                    rowData.rowDef = rowDef;
                    rowData.attributes = attributes;
                    rowData.properties = properties;

                    data.push(rowData);
                }
            }
        }

        return data;
    }

    _showMatchedEntitiesPerPermissions(entities = []) {
        this._canMerge = this.isCreateProcess && this._showDiscard ? false : this._matchPermissions.mergePermission;
        this._showDiscard = !this.isCreateProcess ? this._canMerge : this._showDiscard;
        if (!this.isCreateProcess && !this._matchPermissions.mergePermission && this._isModelAvailable) {
            if (!this.isCompareProcess || (this.isCompareProcess && !this.isCompareReadonly)) {
                this._matchProcessMessage = this.localize('RvwActPDMsg');
            }
        }
        if (!ObjectUtils.isEmpty(entities)) {
            this._showMatchedEntities(entities);
        } else {
            this._prepareGridData(false); //Only with models
            this._setEntitiesToGrid();
        }
    }

    _showMatchedEntities(entities) {
        this.matchedEntityIds = entities.map(entity => entity.id);
        this.matchedEntityTypes = _.uniq(entities.map(entity => entity.type));
        if (ObjectUtils.isEmpty(this.matchedEntitiesData) || this.isCreateProcess) {
            this.matchedEntitiesData = entities;
        }
        this._triggerMatchAndMergeProcess();
    }

    _triggerMatchAndMergeProcess() {
        this._prepareContext();
        this._prepareGridData();
    }

    _prepareEntities(matchedEntities, type) {
        let entities = {
            fullList: [],
            createList: [],
            mergeList: [],
            createOrMergeList: [],
            matchedEntitiesData: matchedEntities
        };
        for (let entity of matchedEntities) {
            let mEntity = {
                id: entity.id,
                type: entity.type || '',
                formattedAttributes: {}
            };

            if (type == 'mlbased') {
                if (ObjectUtils.isValidObjectPath(entity, 'data.attributes') && entity.data.attributes) {
                    for (let attributeName in entity.data.attributes) {
                        let attribute = entity.data.attributes[attributeName];

                        // When feedback is enabled, we get the details as group >> score
                        if (ObjectUtils.isValidObjectPath(attribute, 'group.0.score')) {
                            attribute = attribute.group[0].score;
                        }

                        let attributeValue = AttributeUtils.getFirstAttributeValue(attribute);
                        if (attributeName == 'score') {
                            mEntity.score = attributeValue;
                        }
                        mEntity.formattedAttributes[attributeName] = attributeValue;
                    }
                }
                if (mEntity.score < this._matchThreshold.create) {
                    entities.createList.push(mEntity);
                } else if (mEntity.score > this._matchThreshold.merge) {
                    entities.mergeList.push(mEntity);
                } else {
                    entities.createOrMergeList.push(mEntity);
                }
            }

            entities.fullList.push(mEntity);
        }

        return entities;
    }

    _prepareGridData(isSourceHasMatchedEntities = true) {
        let attrRows = [];
        let relRows = [];
        let entityModel = this._entityModels[0];
        if (entityModel) {
            // to get value of attribute tagged with "isExternalName" flag to show as entity title
            let entityTitle = DataHelper.getExternalNameAttributeFromModel(entityModel);
            if (entityTitle) {
                this.entityTitle = entityTitle;
            }
        }
        this._sortModels();

        this._models = {
            attributeModels: this._attributeModels,
            relationshipModels: this._relationshipModels
        };

        this._prepareGridRowsModel(attrRows);
        this._attributeRowsModel = attrRows;
        this._prepareGridRowsModel(relRows, true);
        //Sort relationship rows
        if (!ObjectUtils.isEmpty(relRows)) {
            relRows = _.sortBy(relRows, 'header');
        }
        this._attributeRowsModel =  this._attributeRowsModel.slice(0, 10) 
        this._relationshipRowsModel = relRows;
        if (isSourceHasMatchedEntities) {
            this._dataGet();
        }
    }

    _sortModels() {
        let attributeNames = [];

        if (this.sortBasedOnAttributeNames) {
            attributeNames = this.attributeNames;
            if (ObjectUtils.isEmpty(attributeNames)) {
                let firstItemContext = ContextUtils.getFirstItemContext(this.contextData);
                if (firstItemContext && firstItemContext.attributeNames) {
                    attributeNames = firstItemContext.attributeNames;
                }
            }
        }

        let probabilisticMatchAttributeObjList = this._getProbabilisticAttributesForGR();
        for (let attrKey in this._attributeModels) {
            if (attributeNames.indexOf(attrKey) != -1) {
                this._attributeModels[attrKey].properties['rank'] = 1; //attributesRank[attrKey];
            } else {
                this._attributeModels[attrKey].properties['rank'] = 2; //defaultRank;
            }
            //set default displaySequence
            if (!this._attributeModels[attrKey].properties['displaySequence']) {
                this._attributeModels[attrKey].properties['displaySequence'] = 9999999;
            }
            //Set match attributes
            this._attributeModels[attrKey].properties['matchRank'] = 9999999;
            let grEntityType = MatchMergeHelper.getGREntityType(this._grmMappingConfig, this.sourceEntityType);
            if (
                this._deterministicMatchAttributes &&
                this._deterministicMatchAttributes[grEntityType] &&
                this._deterministicMatchAttributes[grEntityType].attributes &&
                this._deterministicMatchAttributes[grEntityType].attributes.includes(attrKey)
            ) {
                this._attributeModels[attrKey].properties['matchRank'] = 1;
            } else if (!ObjectUtils.isEmpty(probabilisticMatchAttributeObjList)) {
                let foundMatchAttribute = probabilisticMatchAttributeObjList.find(attrObj =>
                    attrObj.attributes.includes(attrKey)
                );
                if (foundMatchAttribute) {
                    this._attributeModels[attrKey].properties['matchRank'] = foundMatchAttribute.sequence + 1;
                }
            }
        }

        this._attributeModels = ObjectUtils.sortObjects(this._attributeModels, [
            'properties.matchRank',
            'properties.rank',
            'properties.displaySequence',
            'properties.externalName'
        ]);
    }

    _prepareGridRowsModel(rows, isRelationship) {
        if (isRelationship) {
            for (let relName in this._relationshipModels) {
                let relModel = this._relationshipModels[relName][0];
                if (relModel) {
                    rows.push({
                        header: relModel.properties.externalName,
                        name: relName
                    });
                }
            }
        } else {
            for (let attrName in this._attributeModels) {
                let attributeModel = this._attributeModels[attrName];
                if (attributeModel) {
                    rows.push({
                        header: attributeModel.properties.externalName,
                        name: attrName,
                        dataType: attributeModel.properties.dataType,
                        displayType: attributeModel.properties.displayType
                    });
                }
            }
        }
    }

    /**
     * UI should display source entity, golden record / representative, golden record / potential matches
     */
    _reArrangeEntity(currentIndex, setIndex) {
        if (currentIndex != -1 && currentIndex != setIndex) {
            let entity = this.entities[currentIndex];
            this.entities.splice(currentIndex, 1);
            this.entities.splice(setIndex, 0, entity);
        }
    }

    async _setEntitiesToGrid(entities = [], isRepresentative = false) {
        let columns = [];
        let items = [];
        let relColumns = [];
        let relItems = [];

        if (entities.length) {
            for (let entity of entities) {
                if (!this._combinedEntitySetForRender.find(v => v.id == entity.id)) {
                    this._combinedEntitySetForRender.push(entity);
                }
            }
        } else {
            this._combinedEntitySetForRender = entities;
        }

        this.entities = this._combinedEntitySetForRender;

        if (this.entities && this.entities.length) {
            this._sortMatchedEntities();
        } else {
            this._noMatchesFound = true;
        }

        //In deterministic match and
        //relationship process system should select other than source entity for merge
        //so no data, there is no point for process
        if (this._noMatchesFound && !this._isCreateProcessWithNoMatch) {
            if ((this.matchType == 'deterministic' && !this.isCreateProcess) || this._isOwnedProcess) {
                this._canMerge = false;
                this._showDiscard = false;
                this._showNotValidForProcess();
                return;
            }
        }

        //Add column for new entity - if compare triggered from entity create
        if (!ObjectUtils.isEmpty(this.sourceEntity)) {
            if (!this.entities.find(v => v.id == this.sourceEntity.id)) {
                this.entities.unshift(this.sourceEntity);
            }
        }
        let defaultSelectedEntity = this._getDefaultSelectedEntity(this.entities);

        if (defaultSelectedEntity) {
            let foundSelectedEntity = this.entities.find(entity => entity.id == defaultSelectedEntity.id);
            if (foundSelectedEntity) {
                foundSelectedEntity.isRep = true;
            }
        }

        //re-arrange isRep
        let repEntityIndex = this.entities.findIndex(entity => entity.id != this.sourceEntity.id && entity.isRep);
        let repEntity;
        if (repEntityIndex != -1) {
            repEntity = this.entities[repEntityIndex];
            this._reArrangeEntity(repEntityIndex, 1);
        }

        //re-arrange isSrcOf
        if (
            !ObjectUtils.isEmpty(this._isSourceOfRelationship) &&
            repEntity &&
            repEntity.id != this._isSourceOfRelationship.relTo.id
        ) {
            let isSourceOfEntityIndex = this.entities.findIndex(
                entity => entity.id == this._isSourceOfRelationship.relTo.id
            );
            this._reArrangeEntity(isSourceOfEntityIndex, 2);
        }

        this.allowMergePreview = this.allowMergePreview ? !this._isCreateProcessWithNoMatch : false;

        let previewEntity;
        if (this._isRelationshipProcess && this.allowMergePreview && !this.isCompareProcess) {
            let previewSelectedEntity = this._isOwnedProcess ? defaultSelectedEntity : this.entities[1];
            previewEntity = await this._getPreviewEntity(previewSelectedEntity, this._isOwnedProcess);
        }

        await this._prepareGridColumnsModelAndData(
            this.entities,
            columns,
            items,
            false,
            defaultSelectedEntity,
            previewEntity,
            isRepresentative
        );
        this._setGridConfigAndData(columns, items, false);

        //Setting only attributes count details
        if (this.isCompareProcess) {
            this._setCompareLabel(columns, 'NA', items);
        }

        //Populate the relGridColumnsModelAndData which will be used to load the relationship model and data when the relationship accordion is tapped
        let isRelationshipTabOpened = this.mergeReviewPanelEl ? this.mergeReviewPanelEl.isRelationshipOpened() : false;
        this.relGridColumnsModelAndDataLoaded = false;
        this.relGridColumnsModelAndData = {
            entities: this.entities,
            relColumns: relColumns,
            relItems: relItems,
            defaultSelectedEntity: defaultSelectedEntity,
            previewEntity: previewEntity,
            isRepresentative: isRepresentative,
            columns: columns,
            items: items
        };

        /** In create flow - if Rel Accordion is not loaded - then when the entity is saved, relationships wont be copied over.
         * To resolve this, when Create button is displayed (source-selected-as-rep or entity-create), load the relationship accordian.
         */
        const loadRelationshipAccordianForCreateFlow = this.isCreateProcess || this._isSourceSelectedAsRepresentative();
        //If the relationship tab is already opened, then load the models and data
        if (isRelationshipTabOpened || loadRelationshipAccordianForCreateFlow) {
            await this._loadRelationshipAccordion();
        }

        this._initiateLoad();
    }

    _initiateLoad() {
        if (this._isInitialLoad) {
            //Load tab
            this._loadTabComponent();
        } else {
            if (this._isNextLoad) {
                this._setOriginalData();
                this._isNextLoad = false;
            }
            //Refresh component
            this._reloadCurrentComponent();
        }

        this._loading = false;
    }

    async _loadRelationshipAccordion() {
        if (!ObjectUtils.isEmpty(this.relGridColumnsModelAndData) && !this.relGridColumnsModelAndDataLoaded) {
            this._loading = true;
            let _entities = this.relGridColumnsModelAndData.entities;
            let _relColumns = this.relGridColumnsModelAndData.relColumns;
            let _relItems = this.relGridColumnsModelAndData.relItems;
            let _defaultSelectedEntity = this.relGridColumnsModelAndData.defaultSelectedEntity;
            let _previewEntity = this.relGridColumnsModelAndData.previewEntity;
            let _isRepresentative = this.relGridColumnsModelAndData.isRepresentative;
            let _items = this.relGridColumnsModelAndData.items;
            let _columns = this.relGridColumnsModelAndData.columns;

            await this._prepareGridColumnsModelAndData(
                _entities,
                _relColumns,
                _relItems,
                true,
                _defaultSelectedEntity,
                _previewEntity,
                _isRepresentative
            );
            this._setGridConfigAndData(_relColumns, _relItems, true);
            this.relGridColumnsModelAndDataLoaded = true;
            if (this.isCompareProcess) {
                this._setCompareLabel(_columns, _relColumns, _items, _relItems);
            }
        }

        this._loading = false;
    }

    _setCompareLabel(columns, relColumns, items, relItems) {
        let compareEntities = [];
        this._matchMergeInformation = '';
        if (!ObjectUtils.isEmpty(columns)) {
            compareEntities = columns.filter(col => col.type == 'sourceCell' || col.type == 'rankingCell');
        } else if (!ObjectUtils.isEmpty(relColumns) && relColumns != 'NA') {
            compareEntities = relColumns.filter(col => col.type == 'sourceCell' || col.type == 'rankingCell');
        }

        if (ObjectUtils.isEmpty(compareEntities)) {
            return;
        }

        let compareMessage = this.localize('CmpEntAttRelTit', {
            noOfEntities: compareEntities.length,
            noOfAttributes: items.length,
            noOfRelationships: relColumns == 'NA' ? this.localize('DetNATxt') : relItems.length,
            context: this._getContextChannel(),
            locale: this._getLocaleExternalName()
        });

        this._matchMergeInformation = compareMessage;
    }

    //Func to fetch locale externalName to dispaly in compare screen
    _getLocaleExternalName() {
        let firstValueContext = ContextUtils.getFirstValueContext(this.contextData);
        if (!ObjectUtils.isEmpty(firstValueContext)) {
            let localeExternalName = firstValueContext.locale;
            let selLocaleObject = LocaleManager.getByName(localeExternalName);
            if (selLocaleObject) {
                localeExternalName = selLocaleObject.externalName;
            }
            return localeExternalName;
        }
    }

    //Func to fetch context channel to dispaly in compare screen
    _getContextChannel() {
        let firstDataContext = ContextUtils.getFirstDataContext(this.contextData);
        if (!ObjectUtils.isEmpty(firstDataContext)) {
            let selContext = Object.values(firstDataContext)[0];
            if (selContext) {
                return selContext;
            }
        }
        return this.localize('CSConTit');
    }

    _loadTabComponent() {
        this._setOriginalData();

        this._tabConfig = {};

        if (!this._ignoreDefaultViewSelection) {
            let selectedView = 'columnar';
            if (!this.isCompareProcess && ['graph', 'chart', 'tabular'].includes(this.defaultTabView)) {
                selectedView = this.defaultTabView;
            }
            this._selectedView = selectedView;
        }

        let tabItems = [
            {
                name: 'columnar',
                title: this.localize('ColVieTxt'),
                selected: this._selectedView == 'columnar',
                enableDropdownMenu: false,
                component: {
                    name: 'rock-merge-review-panel',
                    path: '../rock-merge-review-panel/rock-merge-review-panel.js',
                    properties: {
                        contextData: this.contextData,
                        config: this._config,
                        models: this._models,
                        gridConfig: this.recommendationGridConfig,
                        gridData: this._gridData,
                        gridColumns: this._gridColumns,
                        viewMode: this.viewMode,
                        mergeReviewValidition: this._mergeReviewValidition,
                        showRelationships: this.showRelationships,
                        isCompareProcess: this.isCompareProcess
                    }
                }
            }
        ];

        if (!this.isCompareProcess) {
            if (this.allowGraphView) {
                tabItems.push({
                    name: 'graph',
                    title: this.localize('GraVieTxt'),
                    selected: this._selectedView == 'graph',
                    enableDropdownMenu: false,
                    component: {
                        name: 'rock-match-merge-graph-view',
                        path: '../rock-match-merge/rock-match-merge-graph-view.js',
                        properties: {
                            contextData: this.contextData,
                            config: this._config,
                            models: this._models,
                            gridData: this._gridData,
                            attributeNames: this.attributeNames,
                            gridConfig: this.recommendationGridConfig,
                            gridColumns: this._gridColumns,
                            viewMode: this.viewMode,
                            mergeReviewValidition: this._mergeReviewValidition
                        }
                    }
                });
            }

            if (this.allowTabularView) {
                let tabularView = ObjectUtils.cloneObject(tabItems[0]);
                tabularView.name = 'tabular';
                tabularView.selected = this._selectedView == 'tabular';
                tabularView.title = this.localize('TabLbl');
                tabularView.component.properties.isTabularView = true;
                tabularView.component.properties.tabularViewMode = this.tabularViewMode;
                tabItems.push(tabularView);
            }
        }

        if (this.allowChartView && !this.isCreateProcess && !this.isCompareProcess) {
            const chartTab = this._createChartTab();
            if (chartTab) {
                tabItems.push(chartTab);
            }
        }

        this._tabConfig = {
            scrollable: false,
            tabItems: tabItems
        };

        this._reloadCurrentComponent();
    }

    _prepareChartTabData() {
        let goldenRecordModel;
        let goldenRecord;
        if (this._modelList && this._modelList.length && this.entities) {
            /** 1. Get the entity type of Golden Record */
            const grEntityType = MatchMergeHelper.getGREntityType(this._grmMappingConfig, this.sourceEntityType);
            /** Below fn takes in name-to-be-matched & returns a fn that will do the eventual matching */
            const matchByModelNameFn = nameToBeMatched => model => model && model.name === nameToBeMatched;
            /** 2. Search for the GR entity type among the list of models we have */
            goldenRecordModel = _.find(this._modelList, matchByModelNameFn(grEntityType));

            /** Search for the GR among entities
             * 1. Case 1 - source entity type is same as GR type => gr id is same as source entity id
             * 2. Case 2 - else look for SR.relTo.id among the entities
             */
            if (grEntityType === this.sourceEntityType) {
                goldenRecord = this.sourceEntity;
            } else {
                const grIdExists = ObjectUtils.isValidObjectPath(this._isSourceOfRelationship, 'relTo.id');
                if (grIdExists) {
                    /** Below fn takes in id-to-be-matched & returns a fn that will do the eventual matching */
                    const matchByEntityIdFn = idToBeMatched => entity => entity && entity.id === idToBeMatched;
                    goldenRecord = _.find(this.entities, matchByEntityIdFn(this._isSourceOfRelationship.relTo.id));
                }
            }
        }
        return {
            model: goldenRecordModel,
            entity: goldenRecord
        };
    }

    _createChartTab() {
        const tabName = 'chart';
        return {
            name: tabName,
            title: this.localize('ChaTxt'),
            selected: this._selectedView === tabName,
            enableDropdownMenu: false,
            component: {
                name: 'rock-match-merge-chart-view',
                path: '../rock-match-merge/rock-match-merge-chart-view.js',
                properties: {
                    contextData: this.contextData,
                    chartsUnavailableMessage: this.localize('ChaUavSelMsg'),
                    ...this._prepareChartTabData()
                }
            }
        };
    }

    _setOriginalData() {
        this._originalComponentData = {
            contextData: this.contextData,
            config: this._config,
            models: this._models,
            gridConfig: this.recommendationGridConfig,
            gridData: ObjectUtils.cloneObject(this._gridData),
            gridColumns: this._gridColumns,
            viewMode: this.viewMode,
            mergeReviewValidition: this._mergeReviewValidition,
            showRelationships: this.showRelationships,
            attributeNames: this.attributeNames
        };
    }

    _reloadCurrentComponent() {
        let currentActiveComponent = this._getCurrentActiveComponent();

        if (!currentActiveComponent) {
            return;
        }

        if (this._markAsRepTriggered || this._isPreviewChanged || this._isContextChanged || this._notificationRefresh) {
            this._originalComponentData.gridData = ObjectUtils.cloneObject(this._gridData);
            this._originalComponentData.config = this._config;
        }

        if (this._isContextChanged) {
            this._originalComponentData.contextData = this.contextData;
            this._originalComponentData.mergeReviewValidition = this._mergeReviewValidition;
            this._originalComponentData.models = this._models;
        }

        this._markAsRepTriggered =
            this._isPreviewChanged =
            this._isContextChanged =
            this._notificationRefresh =
            this._isTabChangeProcess =
                false;

        if (this._selectedView === 'chart') {
            currentActiveComponent.contextData = this._originalComponentData.contextData;
            const { model, entity } = this._prepareChartTabData();
            currentActiveComponent.model = model;
            currentActiveComponent.entity = entity;
        } else {
            currentActiveComponent.contextData = this._originalComponentData.contextData;
            currentActiveComponent.config = this._config;
            currentActiveComponent.models = this._models;
            currentActiveComponent.gridConfig = this._originalComponentData.gridConfig;
            currentActiveComponent.gridData = this._gridData;
            currentActiveComponent.gridColumns = this._originalComponentData.gridColumns;
            currentActiveComponent.viewMode = this._originalComponentData.viewMode;
            currentActiveComponent.mergeReviewValidition = this._originalComponentData.mergeReviewValidition;
            currentActiveComponent.showRelationships = this._originalComponentData.showRelationships;
        }
        if (this._selectedView == 'graph') {
            currentActiveComponent.attributeNames = this._originalComponentData.attributeNames;
        }

        if (currentActiveComponent.refresh) {
            currentActiveComponent.refresh();
        }

        if (this._selectedView == 'columnar') {
            let attributeGrid = this._getMergeGrid();
            let relationshipGrid = this._getMergeGrid(true);
            this._resetGridColumns(attributeGrid);
            this._resetGridColumns(relationshipGrid);
        }
    }

    _resetGridColumns(mergeGrid) {
        setTimeout(() => {
            if (mergeGrid) {
                if (ObjectUtils.isValidObjectPath(mergeGrid, 'gridOptions.api.columnController.columnApi')) {
                    let columns = mergeGrid.gridOptions.api.columnController.columnApi.getAllColumns() || [];
                    columns.forEach(columnNode => {
                        columnNode.minWidth = 100; //Reset minWidth
                    });
                }
                mergeGrid.gridOptions.api.sizeColumnsToFit();
            }
        }, 0);
    }

    _showNotValidForProcess(message) {
        this._loading = false;
        this.showActionButtons = this.isBulkProcess ? true : false;
        this._showMessageOnly = true;

        if (message) {
            this._matchProcessMessage = message;
            return;
        }

        let entityName = this.sourceEntity && this.sourceEntity.name ? this.sourceEntity.name : this.localize('EntTxt');
        this._matchProcessMessage = this.isBulkProcess
            ? this.localize('EntMerNotVldMulMsg', { entityName: entityName })
            : this.localize('EntMerNotVldSinMsg', { entityName: entityName });
    }

    _setGridConfigAndData(columns, items, isRelationship) {
        let gridConfig = this._getBaseGridConfig();
        if (ObjectUtils.isEmpty(gridConfig)) {
            LoggerManager.logError(this, 'Match grid view configuration missing.');
        } else {
            gridConfig.itemConfig.fields = columns;
            gridConfig.itemConfig.rows = isRelationship ? this._relationshipRowsModel : this._attributeRowsModel;
            if (isRelationship) {
                this._relationshipGridConfig = this._getConfigWithUpdatedTitle(gridConfig, this.entities);
                this._relationshipGridData = this._relationshipData = items;
            } else {
                this._attributeGridConfig = this._getConfigWithUpdatedTitle(gridConfig, this.entities);
                this._attributeGridData = this._attributeData = items;
            }

            this._gridData = {
                attributeGridData: this._attributeGridData,
                relationshipGridData: this._relationshipGridData
            };

            this._config = {
                attributeGridConfig: this._attributeGridConfig,
                relationshipGridConfig: this._relationshipGridConfig
            };
        }
    }

    //Todo, Move this functionality to common behavior
    _sortMatchedEntities() {
        if (ObjectUtils.isEmpty(this._mlBasedResults) || this._mlBasedResults.fullList.length <= 1) {
            return;
        }
        //Sort matched entities
        let sortedMatchedEntities = _.sortBy(this._mlBasedResults.fullList, function (mlMatchItem) {
            return parseFloat(mlMatchItem.score);
        }).reverse(); //desc
        let entities = [];
        sortedMatchedEntities.forEach(matchedEntity => {
            let foundEntity = this.entities.find(entity => entity.id == matchedEntity.id);
            if (foundEntity) {
                entities.push(foundEntity);
            }
        });
        if (!ObjectUtils.isEmpty(entities)) {
            this.entities.forEach(entity => {
                if (entity.id != this.sourceEntity.id && !entities.find(sortedEnt => sortedEnt.id == entity.id)) {
                    entities.push(entity);
                }
            });
            this.entities = entities;
        }
    }

    _getConfigWithUpdatedTitle(gridConfig, entities) {
        if (!ObjectUtils.isEmpty(this.matchTitle)) {
            let title = this._noMatchesFound
                ? this.localize('NoMatMsg')
                : this.localize('EntMatMsg', { noOfEntities: entities.length - 1 });
            if (title) {
                title = title.replace('{noOfEntities}', entities.length - 1);
                if (entities && entities.length == 0) {
                    title = this.localize('MatEntNoDetTxt');
                    this.showCreateButton = false;
                    this.showMergeButton = false;
                }
                gridConfig.titleTemplates.compareEntitiesTitle = title;
            }
        }
        return gridConfig;
    }

    async _getPreviewEntity(defaultSelectedEntity, isOwnedProcess) {
        let previewEntity;
        let reqEntity = ObjectUtils.cloneObject(this.sourceEntity);
        reqEntity = EntityUtils.getEntityWithoutCoalesceData(reqEntity, this.contextData);
        reqEntity.id = defaultSelectedEntity.id;
        reqEntity.type = defaultSelectedEntity.type;
        reqEntity.name = defaultSelectedEntity.name;
        reqEntity.typeExternalName = defaultSelectedEntity.typeExternalName;

        let entityPreviewRequest = {
            params: {
                authorizationType: 'accommodate'
            },
            entity: reqEntity
        };

        if (
            entityPreviewRequest &&
            entityPreviewRequest.entity &&
            ObjectUtils.isEmpty(entityPreviewRequest.entity.version)
        ) {
            delete entityPreviewRequest.entity.version;
        }

        let entityPreviewResponse = await this._fetchDetails(
            entityPreviewRequest,
            '/data/pass-through/entityservice/mergepreviewv2'
        );
        if (ObjectUtils.isValidObjectPath(entityPreviewResponse, 'response.entities.0')) {
            previewEntity = entityPreviewResponse.response.entities[0];
        }

        //Manage entity data based on contexts
        let dataContext = ContextUtils.getFirstDataContext(this.contextData);
        if (!ObjectUtils.isEmpty(previewEntity)) {
            if (ObjectUtils.isEmpty(dataContext)) {
                if (previewEntity.data) {
                    delete previewEntity.data.contexts;
                }
            } else {
                if (previewEntity.data && previewEntity.data.contexts) {
                    let ctxEntity = previewEntity.data.contexts.find(ctxEnt =>
                        ObjectUtils.compareObjects(dataContext, ctxEnt.context)
                    );
                    if (!ObjectUtils.isEmpty(ctxEntity)) {
                        previewEntity.data.contexts = [ctxEntity];
                    }
                }
            }
        }

        //Format preview entity
        if (!ObjectUtils.isEmpty(previewEntity)) {
            let formattedPreviewEntity = JSON.stringify(previewEntity, this.formatPreviewEntity);
            previewEntity = JSON.parse(formattedPreviewEntity);
        }
        return previewEntity;
    }

    //Converts integer/decimal/boolean to string
    formatPreviewEntity(key, value) {
        if (typeof value === 'boolean' || typeof value === 'number') {
            return String(value);
        }
        return value;
    }

    _getRelationshipItemObjectAndValue(entity, row) {
        let relationships =
            DataTransformHelper.transformRelationships(
                entity,
                this._relationshipModels,
                this._contextData,
                null,
                false,
                true
            ) || {};
        let _isRelationshipMapped = false;
        this._entityModels.forEach(function (currentModel) {
            let rels = ObjectUtils.isValidObjectPath(currentModel, 'data.contexts.0.relationships')
                ? currentModel.data.contexts[0].relationships
                : currentModel.data.relationships;
            if (rels[row.name]) {
                _isRelationshipMapped = true;
            }
        }, this);

        let itemValue = '';
        if (!_isRelationshipMapped) {
            itemValue = 'NA';
        } else if (relationships && relationships[row.name]) {
            itemValue = relationships[row.name];
        } else {
            itemValue = '';
        }

        return {
            relationshipObject: relationships[row.name] || [],
            relationshipValue: itemValue
        };
    }

    _getAttributeItemObjectAndValue(entity, row) {
        //Cloning the attributeModel to prevent overwriting it with Read/Write Permissions
        //TODO : Need to correct the flow to make sure only representative attributeModel is read and used
        let _rowAttributeModel = _.filter(this._attributeModels, function (item) {
            return item.name == row.name;
        });
        //Only the attributeModel for the given row is needed
        let clonedAttributeModel = ObjectUtils.cloneObject(_rowAttributeModel);
        let attributes = DataTransformHelper.transformAttributes(
            entity,
            clonedAttributeModel,
            this._contextData,
            null,
            false,
            true
        );
        let _isAttributeMapped = false;
        this._entityModels.forEach(function (currentModel) {
            let attrs = ObjectUtils.isValidObjectPath(currentModel, 'data.contexts.0.attributes')
                ? currentModel.data.contexts[0].attributes
                : currentModel.data.attributes;
            if (attrs[row.name]) {
                _isAttributeMapped = true;
            }
        }, this);

        let currAttrDataType = row.dataType;
        let itemValue;
        if (!_isAttributeMapped) {
            itemValue = 'NA';
        } else if (currAttrDataType == 'datetime' || currAttrDataType == 'date') {
            itemValue = DateTimeFormatUtils.convertFromISODateTime(
                this._getAttributeValue(attributes[row.name]),
                currAttrDataType
            );
        } else if (attributes && attributes[row.name]) {
            itemValue = this._getAttributeValue(attributes[row.name]);
        } else {
            itemValue = '';
        }

        //Sort collection value for proper comparision
        if (
            !ObjectUtils.isEmpty(itemValue) &&
            this._attributeModels[row.name] &&
            this._attributeModels[row.name].isCollection &&
            this._attributeModels[row.name].dataType != 'nested'
        ) {
            itemValue = _.sortBy(itemValue.split(Constants.COLLECTION_SEPARATOR)).join(Constants.COLLECTION_SEPARATOR);
            if (attributes[row.name] && attributes[row.name].value) {
                let valueObjList = ObjectUtils.cloneObject(attributes[row.name].value);
                valueObjList = valueObjList.map((value, index) => {
                    return {
                        value: value,
                        uom: attributes[row.name].uom ? attributes[row.name].uom[index] : '',
                        src: attributes[row.name].src ? attributes[row.name].src[index] : '',
                        valueIds: attributes[row.name].valueIds ? attributes[row.name].valueIds[index] : ''
                    };
                });
                let sortedValueObjList = _.sortBy(valueObjList, 'value');
                attributes[row.name].value = sortedValueObjList.map(obj => obj.value);
                if (attributes[row.name].src) {
                    attributes[row.name].src = sortedValueObjList.map(obj => obj.src);
                }
                if (attributes[row.name].uom) {
                    attributes[row.name].uom = sortedValueObjList.map(obj => obj.uom);
                }
                if (attributes[row.name].valueIds) {
                    attributes[row.name].valueIds = sortedValueObjList.map(obj => obj.valueIds);
                }
            }
        }

        return {
            attributeObject: attributes[row.name],
            attributeValue: itemValue
        };
    }

    _getAttributeGroups() {
        let attributeGroups = [];
        let attributes = this._attributeModels || {};

        if (ObjectUtils.isEmpty(attributes)) {
            let sourceModel = this._modelList.find(
                model => model.name == this.sourceEntityType && model.entityId == this.sourceEntityId
            );
            if (ObjectUtils.isEmpty(sourceModel)) {
                return;
            }

            let dataContext = ContextUtils.getFirstDataContext(this.contextData);
            if (
                !ObjectUtils.isEmpty(dataContext) &&
                ObjectUtils.isValidObjectPath(sourceModel, 'data.contexts.0.attributes')
            ) {
                attributes = sourceModel.data.contexts[0].attributes;
            }

            if (ObjectUtils.isEmpty(attributes) && ObjectUtils.isValidObjectPath(sourceModel, 'data.attributes')) {
                attributes = sourceModel.data.attributes;
            }
        }

        if (!ObjectUtils.isEmpty(attributes)) {
            for (let attributeName in attributes) {
                let attributeGroupName = attributes[attributeName].properties.groupName || '';
                if (attributeGroupName && !attributeGroups.find(group => group.value == attributeGroupName)) {
                    attributeGroups.push({
                        value: attributeGroupName,
                        title: attributeGroupName
                    });
                }
            }
        }

        let sortedGroups = _.sortBy(attributeGroups, 'value');
        sortedGroups.unshift({
            value: 'None',
            title: 'None'
        });

        return sortedGroups;
    }

    _getProbabilisticAttributesForGR() {
        let grEntityType = MatchMergeHelper.getGREntityType(this._grmMappingConfig, this.sourceEntityType);
        let probabilisticMatchAttributes = [];
        let isProbabilisticMatchApplicable =
            this._deterministicMatchAttributes[grEntityType] &&
            this._deterministicMatchAttributes[grEntityType].isProbabilisticMatchApplicable;
        if (grEntityType && isProbabilisticMatchApplicable) {
            probabilisticMatchAttributes = this._familySourceAttributes[grEntityType];
        }
        return probabilisticMatchAttributes;
    }

    async _prepareGridColumnsModelAndData(
        entities,
        columns,
        items,
        isRelationship,
        defaultSelectedEntity,
        previewEntity,
        isRepresentative
    ) {
        let rowsModel = isRelationship ? this._relationshipRowsModel : this._attributeRowsModel;

        let mergeReviewPanel = this.mergeReviewPanelEl;
        let filterText = '';

        if (mergeReviewPanel && isRepresentative) {
            let mergeGrid = this._getMergeGrid(isRelationship);
            if (mergeGrid) {
                let filterCell = mergeGrid.shadowRoot.querySelector('filter-cell');

                if (filterCell) {
                    filterText = filterCell.text;
                }
            }
        }

        //Get probabilistic match attributes
        let probabilisticMatchAttributeObjList = this._getProbabilisticAttributesForGR();
        let probabilisticMatchAttributes = [];
        let grEntityType = MatchMergeHelper.getGREntityType(this._grmMappingConfig, this.sourceEntityType);
        if (!isRelationship && !this.isCompareProcess) {
            if (!ObjectUtils.isEmpty(probabilisticMatchAttributeObjList)) {
                probabilisticMatchAttributeObjList.forEach(matchAttrObj => {
                    probabilisticMatchAttributes = probabilisticMatchAttributes.concat(matchAttrObj.attributes);
                });
                probabilisticMatchAttributes = _.uniq(probabilisticMatchAttributes);
            }
        }

        if (!ObjectUtils.isEmpty(rowsModel)) {
            let rowHeader = {
                header: isRelationship ? this.localize('RelTxt') : this.localize('AttTxt'),
                name: isRelationship ? 'Relationships' : 'Attributes',
                isRelationship: isRelationship,
                filterBy: isRelationship ? 'Relationships' : 'Attributes',
                isRowHeader: true,
                isSelected: false,
                isDefaultSelected: false,
                minWidth: 300,
                type: 'attributeCell',
                checkbox: {
                    show: false,
                    disabled: false,
                    checked: false
                },
                pinned: 'left',
                filterText: filterText,
                showFilterDropDown: true,
                selectedAttributeValueFilter: this.selectedAttributeValueFilter,
                selectedRelationshipValueFilter: this.selectedRelationshipValueFilter,
                attributeGroups: this._getAttributeGroups()
            };
            //Set enable column select as per merge permission
            if (this.enableColumnSelect) {
                this.enableColumnSelect = this._canMerge;
            }
            if (this.enableColumnSelect) {
                rowHeader['selectable'] = {
                    isAction: false,
                    text: this.localize('SelMerCreMsg')
                };
            }
            columns.push(rowHeader);
            let defaultSelectedEntityId = defaultSelectedEntity.id;
            let matchedEntities = this.entities
                .filter(entity => entity.id != this.sourceEntityId)
                .map(entity => {
                    return { id: entity.id, type: entity.type };
                });
            let dataContext = ContextUtils.getFirstDataContext(this.contextData);

            for (let i = 0; i < rowsModel.length; i++) {
                let item = {};
                let row = rowsModel[i];
                let dataObject = {};
                for (let entity of entities) {
                    let entityHeader = this._getEntityHeader(entity);
                    if (i == 0) {
                        let colDetails = {
                            header: entityHeader,
                            subHeader: this._getEntitySubHeader(entity),
                            columnType: entity.type,
                            typeIcon: this._getTypeIconNameById(entity.type),
                            grmStates: this.isCompareProcess ? {} : this._entitiesGRMStates[entity.id],
                            name: entity.id,
                            isRelationship: isRelationship,
                            isSourceOfEntity:
                                this._isSourceOfRelationship &&
                                this._isSourceOfRelationship.relTo &&
                                this._isSourceOfRelationship.relTo.id == entity.id,
                            mergeSequenceDetails: this._getMergeSequenceDetails(entity.type),
                            userAsSource: this._userAsSource,
                            link: this._getLink(
                                entity.id,
                                `entity-manage?id=${encodeURIComponent(entity.id)}&type=${encodeURIComponent(
                                    entity.type
                                )}`
                            ),
                            isSelected: false,
                            isDefaultSelected: false,
                            minWidth: 300,
                            type: 'rankingCell',
                            checkbox: {
                                show: this.isCompareProcess && this.isCompareReadonly ? false : true,
                                disabled: this.matchType == 'deterministic' && this._showDiscard,
                                checked: false
                            },
                            hideRowCheckbox: false,
                            showActions: true,
                            actions:
                                this._isWhereusedProcess && !this.isCompareProcess
                                    ? []
                                    : [
                                          {
                                              icon: 'pebble-icon:mark-representative',
                                              label: 'Set as Representative',
                                              action: 'mark-as-representative',
                                              hideOnDisable: true
                                          }
                                      ]
                        };
                        //Always default selection is only one entity
                        if (defaultSelectedEntityId == entity.id) {
                            colDetails['selectable'] = {
                                isAction: true,
                                disable: !this._canMerge
                            };
                            colDetails['checkbox'] = {
                                show: this.isCompareProcess && this.isCompareReadonly ? false : true,
                                disabled: true,
                                checked: true
                            };
                            colDetails['isSelected'] = true;
                            colDetails['isDefaultSelected'] = true;
                            colDetails.isRepresentative = true;
                            colDetails.mergeModelDetails = await this._getMergeModelDetails(colDetails.columnType);
                            colDetails.actions = [];
                            colDetails.isPreviewProcess = !!this._isRelationshipProcess;
                            colDetails.allowMergePreview = this.isCreateProcess ? false : !!this.allowMergePreview;
                        }

                        colDetails.showMergePreviewToggle = !!this._isRelationshipProcess;
                        colDetails.isWhereusedProcess = !!this._isWhereusedProcess;
                        colDetails.isCompareProcess = !!this.isCompareProcess;
                        colDetails['disableHeaderCell'] = this.matchType == 'deterministic' && this._showDiscard;

                        if (this.sourceEntity.id == entity.id) {
                            colDetails['pinned'] = 'left';
                            colDetails['type'] = 'sourceCell';
                            if (
                                !this.restrictDeleteAction &&
                                !this.isCreateProcess &&
                                this._isOwnedProcess &&
                                this._canMerge
                            ) {
                                colDetails.actions.push({
                                    icon: 'pebble-icon:delete',
                                    label: this.localize('DltTxt'),
                                    action: 'remove-source'
                                });
                            }
                            if (!ObjectUtils.isEmpty(this._mlBasedResults)) {
                                colDetails.actions.push({
                                    icon: 'pebble-icon:Info',
                                    label: this.localize('InfoTxt'),
                                    action: 'on-match-information'
                                });
                            }
                        }

                        if (
                            ((this._isWhereusedProcess && defaultSelectedEntityId != entity.id) ||
                                (this._isOwnedProcess &&
                                    this.sourceEntity.id == entity.id &&
                                    ObjectUtils.isValidObjectPath(
                                        this.sourceEntity,
                                        'data.relationships.issourceof.0'
                                    ))) &&
                            this.mergeReviewActionAccess.unmergesource &&
                            !this.isCompareProcess
                        ) {
                            colDetails.actions.push({
                                icon: 'pebble-icon:mark-unlink',
                                label: this.localize('UnMerTxt'),
                                action: 'unmerge-source'
                            });
                        }

                        //TODO - When whereused - mergepreview is enabled, then change the logic here
                        if (this._isRelationshipProcess && defaultSelectedEntityId == this.sourceEntity.id) {
                            colDetails.isPreviewProcess = false;
                            colDetails.allowMergePreview = false;
                            colDetails.showMergePreviewToggle = false;
                        }

                        columns.push(colDetails);
                    }

                    if (isRelationship) {
                        let relData = this._getRelationshipItemObjectAndValue(entity, row);
                        dataObject[entity.id] = relData.relationshipObject;
                        item[entity.id] = relData.relationshipValue;
                    } else {
                        let attrData = this._getAttributeItemObjectAndValue(entity, row);
                        dataObject[entity.id] = attrData.attributeObject;
                        let attributeValue = attrData.attributeValue;
                        item[entity.id] = attributeValue;
                    }
                }

                if (isRelationship) {
                    this._setFilterPropertiesToRelationshipItem(item);
                    item['Relationships'] = row.header;
                    let relModel = {};
                    if (this._relationshipModels[row.name] && this._relationshipModels[row.name].length) {
                        relModel =
                            this._relationshipModels[row.name].find(
                                model => model.properties.relationshipOwnership == 'owned'
                            ) || {};
                    }
                    item.relationshipModel = relModel;
                    item.relationshipName = row.name;
                    item['relationshipObject'] = dataObject;
                    item['itemMissingModelTypes'] = this._getItemMissingModelTypes(
                        row.name,
                        matchedEntities,
                        !ObjectUtils.isEmpty(dataContext),
                        true
                    );
                } else {
                    this._setFilterPropertiesToAttributeItem(item, row.dataType);
                    item['attributeObject'] = dataObject;
                    item['attributeModel'] = this._attributeModels[row.name] || {};
                    item['Attributes'] = row.header || row.name;
                    item['attributeName'] = row.name;
                    item['groupName'] = this._attributeModels[row.name].groupName || '';
                    item['itemMissingModelTypes'] = this._getItemMissingModelTypes(
                        row.name,
                        matchedEntities,
                        !ObjectUtils.isEmpty(dataContext)
                    );

                    if (this._mlBasedResults && !ObjectUtils.isEmpty(this._mlBasedResults.fullList)) {
                        let foundMatchAttributeObjList = probabilisticMatchAttributeObjList.filter(matchObj =>
                            matchObj.attributes.includes(row.name)
                        );
                        if (foundMatchAttributeObjList) {
                            let mlDetails = {};
                            this._mlBasedResults.fullList.forEach(matchEntity => {
                                foundMatchAttributeObjList.forEach(foundMatchAttributeObj => {
                                    let currentFamilyIndex = this.familyAttributesSequence.findIndex(
                                        family => family == foundMatchAttributeObj.familyName
                                    );
                                    if (matchEntity.formattedAttributes[foundMatchAttributeObj.familyName]) {
                                        if (
                                            !ObjectUtils.isEmpty(mlDetails[matchEntity.id]) &&
                                            currentFamilyIndex != -1 &&
                                            mlDetails[matchEntity.id].familySequence < currentFamilyIndex
                                        ) {
                                            return;
                                        }
                                        mlDetails[matchEntity.id] = {
                                            attributeName: row.name,
                                            familyName: foundMatchAttributeObj.familyName,
                                            familySequence: currentFamilyIndex,
                                            matchScoreLabel:
                                                matchEntity.formattedAttributes[foundMatchAttributeObj.familyName]
                                        };
                                    }
                                });
                            });
                            item['mlDetails'] = mlDetails;
                        }
                    }
                }

                //Set the unmapped, match attribute filters
                item['unmapped'] = !ObjectUtils.isEmpty(item.itemMissingModelTypes);
                item['isMatchAttribute'] =
                    !this.isCompareProcess &&
                    !isRelationship &&
                    item.attributeName &&
                    (probabilisticMatchAttributes.includes(item.attributeName) ||
                        (ObjectUtils.isValidObjectPath(this._deterministicMatchAttributes, `${grEntityType}.attributes`)
                            ? this._deterministicMatchAttributes[grEntityType].attributes
                            : []
                        ).includes(item.attributeName));

                if (this._isRelationshipProcess) {
                    if (!ObjectUtils.isEmpty(previewEntity)) {
                        if (isRelationship) {
                            let relData = this._getRelationshipItemObjectAndValue(previewEntity, row);
                            item['previewObject'] = relData.relationshipObject;
                            item['previewValue'] = relData.relationshipValue;
                            item['previewRelationshipEntityData'] = await this._getPreviewRelationshipEntityData(
                                relData.relationshipObject
                            );
                        } else {
                            let attrData = this._getAttributeItemObjectAndValue(previewEntity, row);
                            item['previewObject'] = attrData.attributeObject;
                            item['previewValue'] = attrData.attributeValue;
                        }
                    }
                    item['isPreviewProcess'] =
                        this._isRelationshipProcess && defaultSelectedEntityId == this.sourceEntity.id ? false : true;
                    item['allowMergePreview'] = !!this.allowMergePreview;
                }
                item['enforceManageModelForMerge'] = this._enforceManageModelForMerge;
                item['transactionEntities'] = this.entities.map(entity => {
                    return {
                        id: entity.id,
                        type: entity.type
                    };
                });
                //TODO - When whereused - mergepreview is enabled, then change the logic here
                item['allowMergePreview'] =
                    this._isRelationshipProcess && defaultSelectedEntityId == this.sourceEntity.id
                        ? false
                        : !!this.allowMergePreview;
                if (this.attributesToBeFreezed.includes(item.attributeName)) {
                    item.isPinnedRow = true;
                }

                let transactionEntityIds = (item.transactionEntities || []).map(entity => entity.id);
                if (item.attributeModel && item.attributeModel.dataType == 'nested') {
                    let childAttributesModel = item.attributeModel.group[0];
                    let flattenedEntityValues = this._flattenEntitiesNestedItems(
                        item,
                        transactionEntityIds,
                        childAttributesModel
                    );
                    this._formatNestedItems(item, flattenedEntityValues, transactionEntityIds, childAttributesModel);
                } else if (isRelationship) {
                    let relationshipModel = item.relationshipModel;
                    let flattenedRelationships = await this._flattenEntitiesRelationships(
                        item,
                        transactionEntityIds,
                        relationshipModel
                    );
                    this._formatRelationships(item, flattenedRelationships, transactionEntityIds, relationshipModel);
                }

                items.push(item);
            }
            //Add flip icon
            columns.forEach((column, index) => {
                let actions = {
                    icon: 'pebble-icon:merge',
                    label: this.localize('GolRecRevTxt'),
                    action: 'flip-source',
                    hideOnDisable: false
                };
                if (!this.isCompareProcess && !this.isCreateProcess && column.name !== this.sourceEntity.id) {
                    if (columns[index].actions) {
                        columns[index].actions.push(actions);
                    } else {
                        columns[index]['actions'] = [actions];
                    }
                }
            });

            //Restrict here, not to create golden column
            if (this.isCompareProcess && this.isCompareReadonly) {
                return;
            }

            if (this.allowStrategyColumn) {
                //push strategy column
                columns.push({
                    header: 'Strategy', //TODO, localization
                    subHeader: this._selectedView == 'tabular' ? 'Strategy' : '',
                    name: 'strategy',
                    isSelected: false,
                    isDefaultSelected: false,
                    minWidth: 200,
                    type: 'goldenCell',
                    showEdit: true,
                    checkbox: {
                        show: false,
                        disabled: false,
                        checked: false
                    },
                    pinned: 'right'
                });
            }

            //push golden column
            columns.push({
                header: 'Golden Data',
                subHeader: !this.isCompareProcess ? this.localize('MatMerGolPreHedTxt') : '',
                name: 'goldendata',
                isSelected: false,
                isDefaultSelected: false,
                isRelationship: isRelationship,
                minWidth: 200,
                type: 'goldenCell',
                showEdit: true,
                checkbox: {
                    show: false,
                    disabled: false,
                    checked: false
                },
                pinned: 'right'
            });
        }
    }

    _getMergeSequenceDetails(entityType) {
        let mergeSequenceDetails = {
            context: '',
            self: ''
        };
        if (this._userAsSource) {
            let dataContext = ContextUtils.getFirstDataContext(this.contextData);
            //Collect the details from model list
            let entityModel = this._modelList.find(model => (model.id = `${entityType}_entityCompositeModel`));
            if (!ObjectUtils.isEmpty(dataContext)) {
                if (
                    ObjectUtils.isValidObjectPath(entityModel, 'data.contexts.0.properties.mergeMatrix.0.mergeSequence')
                ) {
                    mergeSequenceDetails.context = entityModel.data.contexts[0].properties.mergeMatrix[0].mergeSequence;
                }
            }
            if (ObjectUtils.isValidObjectPath(entityModel, 'properties.mergeMatrix.0.mergeSequence')) {
                mergeSequenceDetails.self = entityModel.properties.mergeMatrix[0].mergeSequence;
            }
        }
        return mergeSequenceDetails;
    }

    /** To support two-way binding */
    _onGridDataChanged(event) {
        if (event && event.detail && event.detail.value) {
            this._gridData = event.detail.value;
        }
    }

    async _getMergeModelDetails(type) {
        if (!this._userAsSource) {
            return {};
        }
        let url = '/data/pass-through/entitymodelservice/get';
        let clonedContextData = ObjectUtils.cloneObject(this.contextData);
        let itemContext = {
            type: 'mergeModel',
            id: `${type}_mergeModel`
        };
        clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [itemContext];
        let req = DataRequestHelper.createEntityGetRequest(clonedContextData);
        delete req.params.options.maxRecords;
        req.params.fields.attributes = ['_ALL'];
        req.params.fields.relationships = ['_ALL'];
        let mergeModel = await DataObjectManager.rest(url, req);

        let sourceBasedScoreAttributes = [];
        let trustScoreConfig = {};
        if (
            ObjectUtils.isValidObjectPath(mergeModel, 'response.entityModels.0') &&
            mergeModel.response.status == 'success'
        ) {
            let dataContext = ContextUtils.getFirstDataContext(clonedContextData);
            let attributes = {};
            if (dataContext) {
                let modelContexts = mergeModel.response.entityModels[0].data.contexts;
                if (modelContexts) {
                    let foundModelContextData = modelContexts.find(ctxObj =>
                        ObjectUtils.compareObjects(ctxObj.context, dataContext)
                    );
                    if (foundModelContextData) {
                        attributes = foundModelContextData.attributes || {};
                    }
                }
            } else {
                attributes = mergeModel.response.entityModels[0].data.attributes || {};
            }
            sourceBasedScoreAttributes = Object.keys(attributes).filter(
                key => attributes[key].properties && attributes[key].properties.strategy == 'SourceBasedScore'
            );
        }

        if (!ObjectUtils.isEmpty(sourceBasedScoreAttributes)) {
            let configResponse = await this._getConfig(`${type}_trustScoreConfig`, 'trustScoreConfig');
            if (
                ObjectUtils.isValidObjectPath(configResponse, 'response.configObjects.0.data.jsonData') &&
                configResponse.response.status == 'success'
            ) {
                trustScoreConfig = configResponse.response.configObjects[0].data.jsonData;
            }
        }

        if (!ObjectUtils.isEmpty(sourceBasedScoreAttributes) && !ObjectUtils.isEmpty(trustScoreConfig)) {
            let mergeModelSequence = [];
            let scoreList = _.sortBy(_.uniq(Object.values(trustScoreConfig)));
            scoreList.forEach(score => {
                let sources = Object.keys(trustScoreConfig).filter(key => trustScoreConfig[key] == score);
                mergeModelSequence.push(sources.join(','));
            });
            return {
                sourceBasedScoreAttributes: sourceBasedScoreAttributes,
                mergeModelSequence: mergeModelSequence.join('>>')
            };
        }
        return {};
    }

    _getItemMissingModelTypes(itemName, matchedEntities = [], isDataContextAvailable = false, isRelationship = false) {
        let itemMissingModelTypes = [];

        for (let entity of matchedEntities) {
            let items = {};
            let model = this._modelList.find(
                modelObj => modelObj.name == entity.type && modelObj.entityId == entity.id
            );
            if (isRelationship) {
                if (isDataContextAvailable && ObjectUtils.isValidObjectPath(model, 'data.contexts.0.relationships')) {
                    items = model.data.contexts[0].relationships;
                }

                if (ObjectUtils.isEmpty(items) && ObjectUtils.isValidObjectPath(model, 'data.relationships')) {
                    items = model.data.relationships;
                }
                if (ObjectUtils.isEmpty((items || {})[itemName])) {
                    itemMissingModelTypes.push(entity);
                }
            } else {
                if (isDataContextAvailable && ObjectUtils.isValidObjectPath(model, 'data.contexts.0.attributes')) {
                    items = model.data.contexts[0].attributes;
                }

                if (ObjectUtils.isEmpty(items) && ObjectUtils.isValidObjectPath(model, 'data.attributes')) {
                    items = model.data.attributes;
                }
                if (ObjectUtils.isEmpty((items || {})[itemName])) {
                    itemMissingModelTypes.push(entity);
                }
            }
        }
        return itemMissingModelTypes;
    }

    async _flattenEntitiesRelationships(item, transactionEntityIds, relationshipModel) {
        const transformedRelationshipValues = {};
        const previewAssetAttribute = this._previewAssetAttribute;
        const originalAssetAttribute = this._originalAssetAttribute;
        const res = await BinaryStreamObjectManager.getDownloadContinuousUrl();
        const binaryStreamObjects = res.response ? res.response.binaryStreamObjects : [];
        const { downloadContinuousURL, replacementObjectKey } = binaryStreamObjects[0].properties;

        for (let entityId of transactionEntityIds) {
            const currentEntityRelationships = item[entityId];
            if (ObjectUtils.isEmpty(currentEntityRelationships)) {
                transformedRelationshipValues[entityId] = [];
                continue;
            }
            const currentEntityTransformedValues = [];
            for (let currentRelationshipValue of currentEntityRelationships) {
                const currentRelationshipObj = {
                    relatedEntityAttributes: {},
                    rsInternalSrc: currentRelationshipValue.src || ''
                };
                if (currentRelationshipValue.relTo) {
                    const relTo = currentRelationshipValue.relTo;
                    currentRelationshipObj.rsInternalEntityId = entityId;
                    const entity = this.entities.find(entity => entity.id == entityId);
                    const entityDetails = this._getEntityExternalDetails(entity);
                    currentRelationshipObj.rsInternalEntityIdentifier = entityDetails.identifier;
                    currentRelationshipObj.rsInternalEntityName = entityDetails.externalName;
                    currentRelationshipObj.rsInternalEntityType = entityDetails.externalType;
                    let relatedEntityDetails = this._getEntityExternalDetails(relTo);
                    currentRelationshipObj.rsInternalRelatedEntityId = relTo.id;
                    currentRelationshipObj.rsInternalRelatedEntityIdentifier = relatedEntityDetails.identifier;
                    currentRelationshipObj.rsInternalRelatedEntityName = relatedEntityDetails.externalName; //(!relTo.name || relTo.name == '_EMPTY') ? '' : relTo.name;
                    currentRelationshipObj.rsInternalRelatedEntityExternalType = relatedEntityDetails.externalType; //this._getExternalEntityType(relTo.type);
                    currentRelationshipObj.relatedEntityAttributes.relationshipType = relTo.type;
                    //Related entity attributes
                    if (relTo.data && relTo.data.attributes) {
                        for (let attrName in relTo.data.attributes) {
                            currentRelationshipObj.relatedEntityAttributes[attrName] =
                                AttributeUtils.getFirstAttributeValue(relTo.data.attributes[attrName]);
                        }
                    }
                }

                //Additional attributes for image display at grid
                currentRelationshipObj.relatedEntityAttributes.rsInternalPreviewAssetAttribute = previewAssetAttribute;
                currentRelationshipObj.relatedEntityAttributes.rsInternalOriginalAssetAttribute =
                    originalAssetAttribute;

                //Prepare previewUrl
                const relatedEntityAttributes = currentRelationshipObj.relatedEntityAttributes;
                if (relatedEntityAttributes[previewAssetAttribute] || relatedEntityAttributes[originalAssetAttribute]) {
                    const previewUrl = downloadContinuousURL.replace(
                        replacementObjectKey,
                        relatedEntityAttributes[previewAssetAttribute] ||
                            relatedEntityAttributes[originalAssetAttribute]
                    );
                    currentRelationshipObj.relatedEntityAttributes['rsInternalPreviewUrl'] = previewUrl || '';
                }

                //Relationship attributes
                if (!ObjectUtils.isEmpty(relationshipModel)) {
                    currentRelationshipObj.relationshipExternalName = relationshipModel.properties
                        ? relationshipModel.properties.externalName
                        : '';
                    const attributeNames = Object.keys(relationshipModel.attributes || {}) || [];
                    if (
                        !ObjectUtils.isEmpty(currentRelationshipValue.attributes) &&
                        !ObjectUtils.isEmpty(attributeNames)
                    ) {
                        const transformedRelationshipAttributesModel =
                            DataTransformHelper.transformRelationshipAttributeModels(relationshipModel);
                        for (let attributeName of attributeNames) {
                            currentRelationshipObj[attributeName] = this._getFormattedAttributeValue(
                                currentRelationshipValue.attributes[attributeName],
                                transformedRelationshipAttributesModel[attributeName]
                            );
                        }
                    }
                }
                currentEntityTransformedValues.push(currentRelationshipObj);
            }
            transformedRelationshipValues[entityId] = currentEntityTransformedValues;
        }

        return transformedRelationshipValues;
    }

    async _formatRelationships(item, flattenedRelationships, transactionEntityIds, relationshipModel) {
        let nestedItemsMatrix = [];
        let allFlattenedRelationships = [];
        for (let entityId of transactionEntityIds) {
            if (flattenedRelationships[entityId]) {
                allFlattenedRelationships = allFlattenedRelationships.concat(flattenedRelationships[entityId]);
            }
        }
        for (let entityId of transactionEntityIds) {
            let currentEntityRels = flattenedRelationships[entityId];
            let compareEntityIds = Object.keys(flattenedRelationships).filter(
                compareEntityId => compareEntityId != entityId
            );
            if (ObjectUtils.isEmpty(compareEntityIds)) {
                this._prepareRelationshipMatrix(nestedItemsMatrix, currentEntityRels, relationshipModel);
                continue;
            } else {
                (currentEntityRels || []).forEach(currentEntityRel => {
                    let status = 'different';
                    let remainingRels = allFlattenedRelationships.filter(
                        rel => rel.rsInternalEntityId != currentEntityRel.rsInternalEntityId
                    );
                    let foundInCompareEntities = remainingRels.filter(
                        rel => rel.rsInternalRelatedEntityId == currentEntityRel.rsInternalRelatedEntityId
                    );

                    if (foundInCompareEntities.length == 0) {
                        status = 'new';
                    } else if (foundInCompareEntities.length == compareEntityIds.length) {
                        //Rel data comparision
                        let currentRel = this._prepareRelationshipWithAttributes(relationshipModel, [currentEntityRel]);
                        let compareEntityRels = this._prepareRelationshipWithAttributes(
                            relationshipModel,
                            foundInCompareEntities
                        );
                        let foundMatchedRelationships = compareEntityRels.filter(compareEntityRel =>
                            ObjectUtils.compareObjects(currentRel[0], compareEntityRel)
                        );

                        if (foundMatchedRelationships.length == compareEntityRels.length) {
                            status = 'same';
                        }
                    }
                    this._prepareRelationshipMatrix(nestedItemsMatrix, [currentEntityRel], relationshipModel, status);
                });
            }
        }
        this._setFilterForRowDataDifference(item, nestedItemsMatrix, 'rsInternalEntityId', 'rsInternalStatus'); //Apply filter for relationships row data
        item.relationshipMatrix = nestedItemsMatrix;
    }

    _setFilterForRowDataDifference(item, nestedItemsMatrix, rowIdKey = 'id', rowStatusKey = 'status') {
        if (
            item.transactionEntities.filter(entity =>
                nestedItemsMatrix.find(nestedItem => nestedItem[rowIdKey] == entity.id)
            ).length == item.transactionEntities.length
        ) {
            if (
                nestedItemsMatrix.filter(nestedItem => nestedItem[rowStatusKey] == 'same').length !=
                nestedItemsMatrix.length
            ) {
                item.diffValues = true;
                item.sameValues = false;
            }
        }
    }

    _prepareRelationshipWithAttributes(relModel, relObjs = []) {
        let compareRels = [];

        if (ObjectUtils.isEmpty(relObjs)) {
            return [];
        }

        relObjs.forEach(relObj => {
            let compareRelObj = {
                id: relObj.rsInternalRelatedEntityId
            };
            if (relModel.attributes) {
                Object.keys(relModel.attributes).forEach(attributeName => {
                    compareRelObj[attributeName] = relObj[attributeName] || '';
                });
            }
            compareRels.push(compareRelObj);
        });

        return compareRels;
    }

    _flattenEntitiesNestedItems(item, transactionEntityIds, childAttributesModel) {
        let transformedEntityValues = {};

        for (let entityId of transactionEntityIds) {
            let currentEntityValues = item[entityId];
            let currentEntityTransformedValues = [];
            currentEntityValues.forEach(currentEntityValue => {
                let currentValueObj = {
                    rsInternalSrc: currentEntityValue.src || ''
                };
                for (let childModelKey in childAttributesModel) {
                    currentValueObj[childModelKey] = '';
                    if (!ObjectUtils.isEmpty(currentEntityValue[childModelKey])) {
                        currentValueObj[childModelKey] = this._getFormattedAttributeValue(
                            currentEntityValue[childModelKey],
                            childAttributesModel[childModelKey]
                        );
                    }
                }
                currentEntityTransformedValues.push(currentValueObj);
            });
            transformedEntityValues[entityId] = currentEntityTransformedValues;
        }

        return transformedEntityValues;
    }

    _getFormattedAttributeValue(attributeValueObj, model) {
        let value = '';
        let uom = '';

        if (ObjectUtils.isValidObjectPath(attributeValueObj, 'values.0')) {
            value = attributeValueObj.values[0].value;
        } else {
            return value;
        }
        if (AttributeUtils.isUomAttribute(model) && value.uom) {
            uom = attributeValueObj.uom;
        }
        value = DataTransformHelper.getFormattedAttributeValue(value, uom, model);
        if (model && !ObjectUtils.isEmpty(value)) {
            if (model.dataType == 'boolean') {
                value = model[`${value}Text`] || value;
            } else if (model.isCollection) {
                value = _.sortBy(value.split(Constants.COLLECTION_SEPARATOR)).join(Constants.COLLECTION_SEPARATOR);
            }
        }

        return value;
    }

    _formatNestedItems(item, flattenedEntityValues, transactionEntityIds, childAttributesModel) {
        let nestedItemsMatrix = [];
        let attributeIdentifiers = Object.keys(childAttributesModel).filter(
            attributeName => childAttributesModel[attributeName].isAttributeIdentifier
        );

        for (let entityId in flattenedEntityValues) {
            let currentEntityValues = flattenedEntityValues[entityId];
            if (!ObjectUtils.isEmpty(currentEntityValues)) {
                let compareEntityIds = transactionEntityIds.filter(id => id != entityId);
                if (ObjectUtils.isEmpty(compareEntityIds)) {
                    this._prepareNestedMatrix(nestedItemsMatrix, currentEntityValues, entityId);
                    continue;
                } else {
                    currentEntityValues.forEach(currentEntityValue => {
                        let compareObjList = [];
                        let currentEntitySrc = currentEntityValue.rsInternalSrc;
                        delete currentEntityValue.rsInternalSrc;
                        for (let compareEntityId of compareEntityIds) {
                            let compareObj = { id: compareEntityId, status: 'same' };
                            let compareEntityValues = flattenedEntityValues[compareEntityId];
                            if (ObjectUtils.isEmpty(compareEntityValues)) {
                                compareObj.status = 'new';
                            } else {
                                let foundMatchValue = compareEntityValues.find(compareEntityValue => {
                                    let compareEntitySrc = compareEntityValue.rsInternalSrc || '';
                                    delete compareEntityValue.rsInternalSrc;
                                    let isCompared = ObjectUtils.compareObjects(currentEntityValue, compareEntityValue);
                                    compareEntityValue.rsInternalSrc = compareEntitySrc;
                                    return isCompared;
                                });
                                if (!foundMatchValue) {
                                    let foundMatchIdentifier = compareEntityValues.find(compareEntityValue => {
                                        let isMatched = true;
                                        if (!ObjectUtils.isEmpty(attributeIdentifiers)) {
                                            for (let attributeIdentifier of attributeIdentifiers) {
                                                if (
                                                    currentEntityValue[attributeIdentifier] !=
                                                    compareEntityValue[attributeIdentifier]
                                                ) {
                                                    isMatched = false;
                                                    break;
                                                }
                                            }
                                        } else {
                                            let compareEntitySrc = compareEntityValue.rsInternalSrc || '';
                                            delete compareEntityValue.rsInternalSrc;
                                            if (!ObjectUtils.compareObjects(compareEntityValue, currentEntityValue)) {
                                                isMatched = false;
                                            }
                                            compareEntityValue.rsInternalSrc = compareEntitySrc;
                                        }

                                        return isMatched;
                                    });
                                    if (!foundMatchIdentifier) {
                                        compareObj.status = 'new';
                                    } else {
                                        compareObj.status = 'different';
                                    }
                                }
                            }
                            compareObjList.push(compareObj);
                        }

                        let status = 'different';
                        if (compareObjList.filter(obj => obj.status == 'same').length == compareEntityIds.length) {
                            status = 'same';
                        } else if (
                            compareObjList.filter(obj => obj.status == 'new').length == compareEntityIds.length
                        ) {
                            status = 'new';
                        }
                        currentEntityValue.rsInternalSrc = currentEntitySrc;
                        this._prepareNestedMatrix(nestedItemsMatrix, [currentEntityValue], entityId, status);
                    });
                }
            }
        }
        item.nestedAttributeIdentifiers = attributeIdentifiers;
        this._setFilterForRowDataDifference(item, nestedItemsMatrix); //Apply filter for nested attribute as per row data
        item.nestedItemsMatrix = nestedItemsMatrix;
    }

    _getEntityExternalDetails(entity) {
        let externalType = '';
        let identifierValue = '';
        let externalNameValue = '';
        if (entity) {
            if (entity.typeExternalName) {
                externalType = entity.typeExternalName;
            } else if (entity.type) {
                externalType = this._getExternalEntityType(entity.type);
            }

            let externalAttributes = this._modelExternalAttributes[entity.type];

            if (ObjectUtils.isValidObjectPath(entity, 'data.attributes')) {
                let entityAttributes = entity.data.attributes;
                if (
                    externalAttributes &&
                    externalAttributes.isEntityIdentifierAttribute &&
                    entityAttributes[externalAttributes.isEntityIdentifierAttribute]
                ) {
                    identifierValue = AttributeUtils.getFirstAttributeValue(
                        entityAttributes[externalAttributes.isEntityIdentifierAttribute]
                    );
                }
                if (
                    externalAttributes &&
                    externalAttributes.isExternalNameAttribute &&
                    entityAttributes[externalAttributes.isExternalNameAttribute]
                ) {
                    externalNameValue = AttributeUtils.getFirstAttributeValue(
                        entityAttributes[externalAttributes.isExternalNameAttribute]
                    );
                }
            }

            if (!externalNameValue) {
                if (entity.name && entity.name != '_EMPTY') {
                    externalNameValue = entity.name;
                }
            }

            if (!identifierValue) {
                identifierValue = entity.id;
            }
        }
        return {
            identifier: identifierValue,
            externalName: externalNameValue,
            externalType: externalType
        };
    }

    _prepareNestedMatrix(nestedItemsMatrix = [], currentEntityValues = [], entityId = '', status = 'different') {
        let entity = this.entities.find(entity => entity.id == entityId);
        let entityDetails = this._getEntityExternalDetails(entity);
        currentEntityValues.forEach(currentEntityValue => {
            nestedItemsMatrix.push({
                id: entityId,
                identifier: entityDetails.identifier,
                name: entityDetails.externalName,
                type: entityDetails.externalType,
                status: status,
                value: currentEntityValue
            });
        }, this);
    }

    _prepareRelationshipMatrix(nestedItemsMatrix, currentEntityRels = [], relationshipModel = {}, status = 'new') {
        currentEntityRels.forEach(currentEntityRel => {
            let relObj = {
                relatedEntityAttributes: currentEntityRel.relatedEntityAttributes,
                rsInternalEntityId: currentEntityRel.rsInternalEntityId,
                rsInternalEntityIdentifier: currentEntityRel.rsInternalEntityIdentifier,
                rsInternalEntityName: currentEntityRel.rsInternalEntityName,
                rsInternalEntityType: currentEntityRel.rsInternalEntityType,
                rsInternalRelatedEntityId: currentEntityRel.rsInternalRelatedEntityId,
                rsInternalRelatedEntityIdentifier: currentEntityRel.rsInternalRelatedEntityIdentifier,
                rsInternalRelatedEntityName: currentEntityRel.rsInternalRelatedEntityName,
                rsInternalRelatedEntityExternalType: currentEntityRel.rsInternalRelatedEntityExternalType,
                rsInternalSrc: currentEntityRel.rsInternalSrc
            };
            if (relationshipModel.attributes) {
                Object.keys(relationshipModel.attributes).forEach(attributeName => {
                    relObj[attributeName] = currentEntityRel[attributeName] || '';
                });
            }
            relObj.rsInternalStatus = status;
            nestedItemsMatrix.push(relObj);
        }, this);
    }

    async _getPreviewRelationshipEntityData(relationshipObject) {
        if (ObjectUtils.isEmpty(relationshipObject)) {
            return;
        }
        let req = DataRequestHelper.createEntityGetRequest(this._contextData, true);
        req.params.fields.attributes = ['_ALL'];
        let types = [];
        let ids = [];
        relationshipObject.forEach(rel => {
            if (rel && rel.relTo) {
                if (types.indexOf(rel.relTo.type) == -1) {
                    types.push(rel.relTo.type);
                }
                if (ids.indexOf(rel.relTo.id) == -1) {
                    ids.push(rel.relTo.id);
                }
            }
        });
        if (req.params && req.params.query) {
            let reqQuery = req.params.query;
            delete reqQuery.id;
            reqQuery.ids = ids;
            if (reqQuery.filters) {
                reqQuery.filters.typesCriterion = types;
            }
        }
        let relationshipEntityGetReq = DataObjectManager.createRequest('getbyids', req, undefined, {
            objectsCollectionName: 'entities'
        });
        let relationshipEntityGetResponse = await DataObjectManager.initiateRequest(relationshipEntityGetReq);
        if (ObjectUtils.isValidObjectPath(relationshipEntityGetResponse, 'response.content.entities')) {
            return relationshipEntityGetResponse.response.content.entities;
        } else {
            return [];
        }
    }

    _getDefaultSelectedEntity(entities) {
        let rEntity = entities.find(v => v.isRep);

        if (!ObjectUtils.isEmpty(rEntity)) {
            return rEntity;
        }

        if (this._isOwnedProcess && !ObjectUtils.isEmpty(this._isSourceOfRelationship)) {
            let foundSourceOfEntity = entities.find(entity => entity.id == this._isSourceOfRelationship.relTo.id);
            if (!ObjectUtils.isEmpty(foundSourceOfEntity)) {
                foundSourceOfEntity.isRep = true;
                return foundSourceOfEntity;
            }
        }

        let selectNonSource = this._isCreateProcessWithNoMatch
            ? false
            : (this.matchType == 'deterministic' && !this.isCreateProcess) || this._isOwnedProcess;
        if (selectNonSource) {
            let nonSourceEntity = entities.find(entity => entity.id != this.sourceEntity.id);
            if (nonSourceEntity) {
                return nonSourceEntity;
            }
        } else {
            return this.sourceEntity;
        }
    }

    _setFilterPropertiesToAttributeItem(item, currAttrDataType) {
        let isEmpty = false;
        let hasPartialValues = false;
        let hasValues = false;
        let sameValues = false;
        let diffValues = false;

        if (currAttrDataType == 'nested') {
            let itemFilter = ObjectUtils.cloneObject(item);
            for (let prop in itemFilter) {
                itemFilter[prop] = itemFilter[prop].length == 0 ? '' : itemFilter[prop].length + ' values';
            }

            //setting filter values for nested attrs
            Object.keys(itemFilter).forEach(function (key) {
                if (!hasPartialValues) {
                    if (ObjectUtils.isEmpty(itemFilter[key])) {
                        if (hasValues) {
                            hasPartialValues = true;
                            hasValues = false;
                        } else {
                            isEmpty = true;
                        }
                    } else {
                        if (isEmpty) {
                            hasPartialValues = true;
                            isEmpty = false;
                        } else {
                            hasValues = true;
                        }
                    }
                }
            }, this);
            if (hasValues) {
                let uniqueValues = _.uniq(_.values(itemFilter));
                if (uniqueValues && uniqueValues.length == 1) {
                    sameValues = true;
                } else {
                    diffValues = true;
                }
            }
        } else {
            let isNumber = false;
            let isBoolean = false;
            //setting filter values for other attrs.
            Object.keys(item).forEach(function (key) {
                //checking for prmitive types which _isEmpty cannot check
                if (item[key]) {
                    if (typeof item[key] === 'number') {
                        item[key] = item[key] + '';
                        isNumber = true;
                    }
                    if (typeof item[key] === 'boolean') {
                        item[key] = item[key] + '';
                        isBoolean = true;
                    }
                }
                if (item[key] === Constants.NULL_VALUE) {
                    item[key] = '';
                }
                if (!hasPartialValues) {
                    if (ObjectUtils.isEmpty(item[key])) {
                        if (hasValues) {
                            hasPartialValues = true;
                            hasValues = false;
                        } else {
                            isEmpty = true;
                        }
                    } else {
                        if (isEmpty) {
                            hasPartialValues = true;
                            isEmpty = false;
                        } else {
                            hasValues = true;
                        }
                    }
                }
            }, this);

            if (hasValues) {
                //comparison of collection type attributes
                if (Array.isArray(item[Object.keys(item)[0]])) {
                    let spreadItems = _.values(item);
                    let areAllArraysEqual = _.isEqual(...spreadItems);
                    sameValues = areAllArraysEqual;
                    diffValues = !sameValues;
                } else {
                    let uniqueValues = _.uniq(_.values(item));
                    if (uniqueValues && uniqueValues.length == 1) {
                        sameValues = true;
                    } else {
                        diffValues = true;
                    }
                }

                //replacing original values once filtering flags are computed
                Object.keys(item).forEach(key => {
                    if (isNumber && !ObjectUtils.isEmpty(item[key])) {
                        item[key] = parseFloat(item[key]).toFixed(2);
                    }
                    if (isBoolean && !ObjectUtils.isEmpty(item[key])) {
                        item[key] = item[key] == 'true';
                    }
                });
                isNumber = false;
                isBoolean = false;
            }
        }

        item['isEmpty'] = isEmpty;
        item['hasPartialValues'] = hasPartialValues;
        item['hasValues'] = hasValues;
        item['sameValues'] = sameValues;
        item['diffValues'] = diffValues;
    }

    _setFilterPropertiesToRelationshipItem(item) {
        let isEmptyRec = false;
        let hasPartialValues = false;
        let hasValues = false;
        let sameValues = false;
        let diffValues = false;

        //using itemFilter as an intermediate thing to set the correct filter values.
        let itemFilter = ObjectUtils.cloneObject(item);
        for (let prop in itemFilter) {
            itemFilter[prop] =
                itemFilter[prop].length == 0 ? '' : itemFilter[prop].length + ' ' + this.localize('RelTxt');
        }

        Object.keys(itemFilter).forEach(function (key) {
            if (!hasPartialValues) {
                if (ObjectUtils.isEmpty(itemFilter[key])) {
                    if (hasValues) {
                        hasPartialValues = true;
                        hasValues = false;
                    } else {
                        isEmptyRec = true;
                    }
                } else {
                    if (isEmptyRec) {
                        hasPartialValues = true;
                        isEmptyRec = false;
                    } else {
                        hasValues = true;
                    }
                }
            }
        }, this);
        if (hasValues) {
            let uniqueValues = _.uniq(_.values(itemFilter));
            if (uniqueValues && uniqueValues.length == 1) {
                sameValues = true;
            } else {
                diffValues = true;
            }
        }

        item['isEmpty'] = isEmptyRec;
        item['hasPartialValues'] = hasPartialValues;
        item['hasValues'] = hasValues;
        item['sameValues'] = sameValues;
        item['diffValues'] = diffValues;
    }

    _getLink(entityId, entityLink) {
        let link = '';
        if (this.enableEntityHeaderLink && entityLink) {
            if (this.isCreateProcess) {
                let newEntityId = '';
                if (this.sourceEntity) {
                    newEntityId = this.sourceEntity.id;
                }
                link = entityId == newEntityId ? '' : entityLink;
            } else {
                link = entityLink;
            }
        }
        return link;
    }

    _getAttributeValue(attribute) {
        if (
            attribute &&
            !ObjectUtils.isEmpty(attribute.value) &&
            this._attributeModels &&
            this._attributeModels[attribute.name]
        ) {
            let attrModel = this._attributeModels[attribute.name];
            if (attrModel.dataType == 'nested') {
                if (attrModel.group && this._attributeModels[attribute.name].group.length > 0) {
                    for (let nestedIdx = 0; nestedIdx < attribute.value.length; nestedIdx++) {
                        for (let key in attrModel.group[0]) {
                            let value = attribute.value[nestedIdx][key] || {};
                            if (value.referenceDataId && value.referenceEntityType) {
                                let referenceData = value.referenceEntityType + '/' + value.referenceDataId;
                                value.properties = value.properties || {};
                                value.properties['referenceData'] = referenceData;
                                delete value.referenceDataId;
                                delete value.referenceEntityType;
                            }
                            attribute.value[nestedIdx][key] = {
                                values: [value]
                            };
                        }
                    }
                }
            } else if (attrModel.isCollection && attribute.value instanceof Array) {
                return DataTransformHelper.formatCollectionAttributeValueForGrid(
                    attribute.value,
                    attribute.uom,
                    attrModel
                );
            }
        }

        if (attribute) {
            if (attribute.value && attribute.uom) {
                let attrModel = this._attributeModels[attribute.name];
                let title = UOMFormatUtils.getUOMDisplayValue(attribute.uom, attrModel);
                return attribute.value + ' ' + title;
            }

            return attribute.value;
        }
        return '';
    }

    async _dataGet() {
        if (this._contextData) {
            let firstItemContext =
                this._contextData[ContextUtils.CONTEXT_TYPE_ITEM] &&
                this._contextData[ContextUtils.CONTEXT_TYPE_ITEM].length
                    ? this._contextData[ContextUtils.CONTEXT_TYPE_ITEM][0]
                    : undefined;
            if (firstItemContext) {
                firstItemContext.type = this.matchedEntityTypes || [];
            }
            let req = DataRequestHelper.createEntityGetRequest(this._contextData, true);
            this._contexts = ContextUtils.getDataContexts(this.contextData);

            req.params.fields.attributes = !ObjectUtils.isEmpty(this._attributeModels)
                ? Object.keys(this._attributeModels)
                : ['_ALL'];
            req.params.fields.relationships = !ObjectUtils.isEmpty(this._relationshipModels)
                ? Object.keys(this._relationshipModels)
                : ['_ALL'];
            req.params.fields.relationshipAttributes = ['_ALL'];
            req.params.fields.relatedEntityAttributes = this._getRelatedEntityAttributes();
            //Add state attributes
            req.params.fields.attributes = req.params.fields.attributes.concat([
                this._grmAttributeNames.grmState,
                this._grmAttributeNames.grmProcessState
            ]);

            if (ObjectUtils.isValidObjectPath(req, 'params.query')) {
                delete req.params.query.ids;
                req.params.query.id = '';
            }

            let entityResponseList;
            if (!ObjectUtils.isEmpty(this.matchedEntityIds)) {
                let getEntityCallList = [];
                for (let matchedEntityId of this.matchedEntityIds) {
                    req.params.query.id = matchedEntityId;
                    let matchedEntityGetReq = DataObjectManager.createRequest('getbyids', req, undefined, {
                        objectsCollectionName: 'entities'
                    });
                    getEntityCallList.push(await DataObjectManager.initiateRequest(matchedEntityGetReq));
                }

                if (!ObjectUtils.isEmpty(getEntityCallList)) {
                    entityResponseList = await Promise.all(getEntityCallList);
                }
            }

            let matchedEntityResponseList = [];
            if (!ObjectUtils.isEmpty(entityResponseList)) {
                entityResponseList.forEach(entityResponse => {
                    if (ObjectUtils.isValidObjectPath(entityResponse, 'response.content.entities.0')) {
                        matchedEntityResponseList.push(entityResponse.response.content.entities[0]);
                    }
                });
            }

            let entities = [];
            if (!ObjectUtils.isEmpty(matchedEntityResponseList)) {
                entities = matchedEntityResponseList;
                //Set grmStates per entity
                entities.forEach(entity => {
                    this._setGRMStateAttributes(entity);
                });
            }
            this._setEntitiesToGrid(entities);
        }
    }

    _getGRMStateAttributeValue(attribute) {
        let value = AttributeUtils.getFirstAttributeValue(attribute);
        if (!value || value == Constants.NULL_VALUE || value == '_EMPTY') {
            return '';
        }
        return value;
    }

    _setGRMStateAttributes(entity) {
        if (entity.data && entity.data.attributes) {
            let grmState = this._getGRMStateAttributeValue(entity.data.attributes[this._grmAttributeNames.grmState]);
            let grmProcessState = this._getGRMStateAttributeValue(
                entity.data.attributes[this._grmAttributeNames.grmProcessState]
            );
            if (grmState || grmProcessState) {
                this._entitiesGRMStates[entity.id] = {
                    grmState: grmState,
                    grmProcessState: grmProcessState,
                    models: this._getGRMStateModels(entity.type)
                };
            }
        }
    }

    _getGRMStateModels(type) {
        let grmStateModels = {};
        if (type && !ObjectUtils.isEmpty(this._modelList)) {
            let currentEntityModel = this._modelList.find(model => model.name == type);
            if (currentEntityModel && currentEntityModel.data && currentEntityModel.data.attributes) {
                let attributeModels = currentEntityModel.data.attributes;
                if (attributeModels[this._grmAttributeNames.grmState]) {
                    grmStateModels[this._grmAttributeNames.grmState] =
                        attributeModels[this._grmAttributeNames.grmState];
                }
                if (attributeModels[this._grmAttributeNames.grmProcessState]) {
                    grmStateModels[this._grmAttributeNames.grmProcessState] =
                        attributeModels[this._grmAttributeNames.grmProcessState];
                }
            }
        }
        return grmStateModels;
    }

    _handleMatchedEntityDataGetFailure(matchedEntityGetResponse) {
        this._loading = false;
        LoggerManager.logError(this, 'Entity get failed due to following reason: ', matchedEntityGetResponse);
    }

    _getBaseGridConfig() {
        return {
            viewMode: 'Tabular',
            readOnly: true,
            schemaType: 'colModel',
            itemConfig: {
                settings: {
                    isMultiSelect: false,
                    disableSelectAll: true
                },
                fields: [],
                rows: []
            },
            viewConfig: {
                tabular: {
                    visible: true
                }
            },
            titleTemplates: {
                compareEntitiesTitle: 'Comparing {noOfEntities} entities for {noOfAttributes} attributes'
            },
            toolbarConfig: {
                buttonItems: [
                    {
                        buttons: [
                            {
                                name: 'pageRange',
                                icon: '',
                                text: '0 - 0 / 0',
                                visible: false,
                                tooltip: this.localize('PRTxt')
                            },
                            {
                                name: 'refresh',
                                icon: 'pebble-icon:refresh',
                                text: '',
                                visible: true,
                                tooltip: this.localize('RfsTxt')
                            }
                        ]
                    }
                ]
            }
        };
    }

    _prepareContext() {
        let clonedContext = ObjectUtils.cloneObject(this.contextData);
        let entityIds = this.matchedEntityIds || [];
        let entityTypes = this.matchedEntityTypes || [];
        if (clonedContext) {
            let itemContext = {
                id: entityIds,
                type: entityTypes,
                attributeNames: !ObjectUtils.isEmpty(this.attributeNames) ? this.attributeNames : ['_ALL']
            };
            clonedContext[ContextUtils.CONTEXT_TYPE_ITEM] = [itemContext];
            this._contextData = clonedContext;
        }
    }

    _onRefreshGrid() {
        this._dataGet();
    }

    _triggerDataUpdate() {
        let mergeReviewPanel = this.mergeReviewPanelEl;
        if (mergeReviewPanel) {
            this._gridData = mergeReviewPanel.gridData;
            this._attributeGridData = this._gridData.attributeGridData;
            this._relationshipGridData = this._gridData.relationshipGridData;
        }
    }

    _getEntityHeader(entity) {
        let header = '';
        if (entity) {
            if (entity[this.entityTitle]) {
                header = entity[this.entityTitle];
            } else {
                let attributes = entity.data.attributes;
                if (attributes && attributes[this.entityTitle]) {
                    header = !ObjectUtils.isEmpty(attributes[this.entityTitle].values)
                        ? attributes[this.entityTitle].values[0].value
                        : '';
                }
            }
            if (header === '' || header === '_EMPTY') {
                header = !ObjectUtils.isEmpty(entity.name) && entity.name != '_EMPTY' ? entity.name : entity.id;
            }
        }

        if (header == '') {
            return '<No Name>';
        } else {
            return header;
        }
    }

    _getEntitySubHeader(entity) {
        let percentage = '';
        let src = '';

        if (entity) {
            let preparedEntities = this.matchedEntitiesData || undefined;
            let preparedEntity = !ObjectUtils.isEmpty(preparedEntities)
                ? preparedEntities.find(obj => obj.id === entity.id)
                : undefined;
            if (preparedEntity) {
                if (preparedEntity.score) {
                    percentage = preparedEntity.score + '%';
                }
            }
            //Do not set src for GR entity
            let sourceOfEntity =
                this._isSourceOfRelationship && this._isSourceOfRelationship.relTo
                    ? this._isSourceOfRelationship.relTo
                    : {};
            let doNotSetSrc = sourceOfEntity && sourceOfEntity.id == entity.id;
            if (!doNotSetSrc && entity.properties && entity.properties.src) {
                src = entity.properties.src;
            }
        }

        return {
            src: src,
            percentage: percentage
        };
    }

    _prepareResults() {
        let externalNameAttr =
            this._entityModels && this._entityModels.length
                ? DataHelper.getExternalNameAttributeFromModel(this._entityModels[0])
                : '';
        let messages = [];
        this.sourceEntitiesData.forEach(source => {
            let name = '';
            if (externalNameAttr && ObjectUtils.isValidObjectPath(source, 'entity.data.attributes')) {
                name = AttributeUtils.getFirstAttributeValue(source.entity.data.attributes[externalNameAttr]);
            }
            let msg = {};
            msg[this.localize('NamTxt')] = name || source.entity.name;
            msg[this.localize('ActPerTxt')] = (this._getLocalizedStatus(source.status) || '').replace(/^\w/, chr =>
                chr.toUpperCase()
            );
            messages.push(msg);
        });
        return { messages: messages, isGrid: true };
    }

    _getLocalizedStatus(status) {
        let localizedStatus = '';
        if (status) {
            switch (status.toLowerCase()) {
                case 'created':
                    localizedStatus = this.localize('CredTxt');
                    break;
                case 'merged':
                    localizedStatus = this.localize('MerTxt');
                    break;
                case 'skipped':
                    localizedStatus = this.localize('SkidTxt');
                    break;
                case 'deleted':
                    localizedStatus = this.localize('DelTxt');
                    break;
                case 'discarded':
                    localizedStatus = this.localize('DisTxt');
                    break;
                case 'linked':
                    localizedStatus = this.localize('LnkdTxt');
                    break;
                case 'unmerge':
                    localizedStatus = this.localize('UnMerStaTxt');
                    break;
            }
        }
        return localizedStatus;
    }

    _notifySourceEntities() {
        let entities = this.sourceEntitiesData;
        this.sourceEntitiesData = [];
        this.sourceEntitiesData = entities;
    }

    async _saveEntity(entity) {
        this._saveRequest = {
            entities: Array.isArray(entity) ? entity : [entity],
            options: {
                serviceName: 'matchandmergeservice',
                ignoreMergeMatrix: true
            }
        };
        //this._triggerGovernRequest(); //Todo, will be enabled for new match merge UI
        this._triggerSaveRequest();
    }

    _getAllowedAttributesAndRelationships(entity) {
        if (!entity || !entity.type) {
            return {
                allowedAttributes: [],
                allowedRelationships: []
            };
        }
        let entityModel = this._modelList.find(model => model.id == `${entity.type}_entityCompositeModel`);
        let dataContext = ContextUtils.getFirstDataContext(this.contextData);
        let allowedAttributes = [];
        let allowedRelationships = [];
        if (ObjectUtils.isEmpty(dataContext)) {
            if (ObjectUtils.isValidObjectPath(entityModel, 'data.attributes')) {
                allowedAttributes = Object.keys(entityModel.data.attributes);
            }
            if (ObjectUtils.isValidObjectPath(entityModel, 'data.relationships')) {
                allowedRelationships = Object.keys(entityModel.data.relationships);
            }
        } else {
            if (ObjectUtils.isValidObjectPath(entityModel, 'data.contexts.0.attributes')) {
                allowedAttributes = Object.keys(entityModel.data.contexts[0].attributes);
            }
            if (ObjectUtils.isValidObjectPath(entityModel, 'data.contexts.0.relationships')) {
                allowedRelationships = Object.keys(entityModel.data.contexts[0].relationships);
            }
        }
        return {
            allowedAttributes: allowedAttributes,
            allowedRelationships: allowedRelationships
        };
    }

    async _getEntityWithGoldenData(ignoreProcessedData = false) {
        this._isAnyChangeInGoldenData = false;
        //Fetch grid details, pick golden data, and do the process
        let attrData = this._getGridDataAndSelectedEntityId(true);
        this.selectedEntityId = attrData.selectedEntityId;

        this._operation =
            this._isReviewEntity ||
            (this.selectedEntityId == this.sourceEntity.id && !this._createdEntity.id && !this._isWhereusedProcess)
                ? 'create'
                : 'update';

        if (!this.selectedEntityId) {
            ToastManager.showWarningToast(this.localize('SelEntWar'));
            return;
        }

        //Prepare entity based on GR data
        let data = attrData.gridData;
        let columns = attrData.gridColumns;
        let attributesJSON = [];
        let srcRemovalAttributeList = [];
        if (data) {
            let isRepresentativeEntity = this.entities.find(entity => entity.isRep);
            if (this._matchProcessType == 'createandlink') {
                isRepresentativeEntity = {
                    type: MatchMergeHelper.getGREntityType(this._grmMappingConfig, this.sourceEntity.type)
                };
                if (this._isCreateProcessWithNoMatch) {
                    this._allowedAttributesAndRelationships =
                        this._getAllowedAttributesAndRelationships(isRepresentativeEntity);
                }
            }

            if (this._selectedView == 'tabular') {
                columns.forEach(col => {
                    if (col.type != 'dataCell') {
                        return;
                    }
                    let columnProcessDetails = col.rsInternalProcessDetails;
                    columnProcessDetails.attributeName = col.columnId;
                    //Collect src removal attr list
                    if (columnProcessDetails.goldenAttribute && columnProcessDetails.goldenAttribute.isValueChanged) {
                        srcRemovalAttributeList.push(columnProcessDetails.attributeName);
                    }

                    if (this.isAttributeAllowForSave(columnProcessDetails, isRepresentativeEntity)) {
                        let goldenAttribute = ObjectUtils.cloneObject(columnProcessDetails.goldenAttribute);
                        let selectedEntityAttribute = {
                            value: ObjectUtils.cloneObject(columnProcessDetails[this.selectedEntityId]) || [],
                            model: columnProcessDetails.attributeModel
                        };
                        this._updateAttributeForDelete(goldenAttribute, selectedEntityAttribute);
                        attributesJSON.push(goldenAttribute.valueObject);
                        //If attribute already involved in save, then consider this attribute in multiple saves
                        if (this._operation == 'update') {
                            if (
                                this._updatedAttributesList.indexOf(columnProcessDetails.attributeName) == -1 &&
                                !ignoreProcessedData
                            ) {
                                this._updatedAttributesList.push(columnProcessDetails.attributeName);
                            }
                        }
                    }
                });
            } else {
                data.forEach(attr => {
                    //Collect src removal attr list
                    if (attr.goldenAttribute && attr.goldenAttribute.isValueChanged) {
                        srcRemovalAttributeList.push(attr.attributeName);
                    }

                    if (this.isAttributeAllowForSave(attr, isRepresentativeEntity)) {
                        let goldenAttribute = ObjectUtils.cloneObject(attr.goldenAttribute);
                        let selectedEntityAttribute = {
                            value: ObjectUtils.cloneObject(attr[this.selectedEntityId]) || [],
                            model: attr.attributeModel
                        };
                        this._updateAttributeForDelete(goldenAttribute, selectedEntityAttribute);
                        attributesJSON.push(goldenAttribute.valueObject);
                        //If attribute already involved in save, then consider this attribute in multiple saves
                        if (this._operation == 'update') {
                            if (this._updatedAttributesList.indexOf(attr.attributeName) == -1 && !ignoreProcessedData) {
                                this._updatedAttributesList.push(attr.attributeName);
                            }
                        }
                    }
                });
            }
        }

        let processEntity = {};
        if (this._operation == 'update') {
            let selectedEntity = this.entities.find(entity => entity.id == this.selectedEntityId);
            processEntity = ObjectUtils.cloneObject(selectedEntity);
            //This update will arise on multiple entity creates
            if (this.sourceEntityId == this.selectedEntityId && !this._isWhereusedProcess) {
                processEntity.type = processEntity.type.replace(this._draftTypePattern, '');
                processEntity.id = this._createdEntity.id;
            }
        } else {
            processEntity = ObjectUtils.cloneObject(this.sourceEntity);
            processEntity.type = this.sourceEntity.type.replace(this._draftTypePattern, '');
            processEntity.id = this.isCreateProcess ? this.sourceEntity.id : 'e' + UniqueIdUtils.getRandomString();
        }

        let entity = await DataTransformHelper.prepareEntityForAttributesSave(
            processEntity,
            attributesJSON,
            this.contextData,
            this._attributeModels,
            false,
            srcRemovalAttributeList
        );

        //Do not consider nested attribute deleted items in comparision
        let clonedAttributesJSON = ObjectUtils.cloneObject(attributesJSON);
        if (!ObjectUtils.isEmpty(clonedAttributesJSON)) {
            let nestedAttributes = Object.keys(this._attributeModels).filter(
                key => this._attributeModels[key] && this._attributeModels[key].dataType == 'nested'
            );
            if (!ObjectUtils.isEmpty(nestedAttributes)) {
                for (let nestAttr of nestedAttributes) {
                    let foundNestedAttr = clonedAttributesJSON.find(attrObj => attrObj.name == nestAttr);
                    if (foundNestedAttr) {
                        foundNestedAttr.value = foundNestedAttr.value.filter(val => val.action != 'delete');
                    }
                }
            }
        }

        if (
            !ObjectUtils.isEmpty(clonedAttributesJSON) &&
            !ObjectUtils.compareObjects(clonedAttributesJSON, this._previousChangedAttributeDetails)
        ) {
            this._isAnyChangeInGoldenData = true;
            if (!ignoreProcessedData) {
                this._previousChangedAttributeDetails = ObjectUtils.cloneObject(clonedAttributesJSON);
            }
        }

        //Update entity with relationships
        await this._updateEntityWithRelationships(entity, ignoreProcessedData);
        //Todo - Transform logic should include src
        return entity;
    }

    updateRelationshipGrid(entity) {
        let relMergeGrid = this.shadowRoot.querySelector('#relationshipGrid');
        if (relMergeGrid) {
            relMergeGrid.clearRelationshipGridPartialData(this._relationshipsAfterApprove, entity.id);
            this._relationshipsAfterApprove = {}; //reset
        }
    }

    async _updateEntityWithRelationships(entity, ignoreProcessedData = false) {
        if (ObjectUtils.isEmpty(entity)) {
            return;
        }

        let currentRelationships = await this._getEntityCurrentRelationships(entity);
        let relGridData = this._getGridDataAndSelectedEntityId();

        let relData = relGridData.gridData;
        let isRepresentativeEntity = this.entities.find(entity => entity.isRep);
        if (this._matchProcessType == 'createandlink') {
            isRepresentativeEntity = {
                type: MatchMergeHelper.getGREntityType(this._grmMappingConfig, this.sourceEntity.type)
            };
        }

        relData.forEach(data => {
            if (this._isItemInMissingModels(data, isRepresentativeEntity, true)) {
                return;
            }
            if (data && data.goldenAttribute) {
                let relType = data.relationshipName;
                let modifiedRelationshipDetails = data.goldenAttribute.relationshipDetails || {};
                let modifiedRelationships = modifiedRelationshipDetails.relationships || [];
                let deletedRels = modifiedRelationships.filter(rel => rel.action == 'delete');
                let addedRels = modifiedRelationships.filter(rel => rel.action != 'delete');
                //Collect original relationships
                let originalRels = [];
                if (ObjectUtils.isEmpty(modifiedRelationships)) {
                    if (data.selectedColumnId) {
                        originalRels = data[data.selectedColumnId];
                    } else {
                        if (
                            ObjectUtils.isValidObjectPath(
                                this._originalComponentData,
                                'config.attributeGridConfig.itemConfig.fields'
                            )
                        ) {
                            let columns = this._originalComponentData.config.attributeGridConfig.itemConfig.fields;
                            let representativeColumn = columns.find(column => column.isRepresentative);
                            if (representativeColumn && representativeColumn.name) {
                                originalRels = data[representativeColumn.name];
                            }
                        }
                    }
                } else {
                    originalRels = data[data.selectedEntityId];
                }
                let relationships = ObjectUtils.cloneObject(originalRels || []); //original relationships
                let previewRelationships = [];
                if (this._isRelationshipProcess && !ignoreProcessedData) {
                    previewRelationships = data.goldenAttribute.originalValueObject;
                }

                if (this._matchProcessType == 'createandlink' && ObjectUtils.isEmpty(relationships)) {
                    relationships = data[data.selectedEntityId] || [];
                }

                if (
                    this._matchProcessType == 'createandlink' ||
                    (modifiedRelationshipDetails && !ObjectUtils.isEmpty(modifiedRelationshipDetails.relationships)) ||
                    entity.id != data.selectedEntityId ||
                    ((!ObjectUtils.isEmpty(data.goldenAttribute.valueObject) ||
                        !ObjectUtils.isEmpty(data[data.selectedEntityId])) &&
                        !this._compareRelationships(
                            data.goldenAttribute.valueObject || [],
                            data[data.selectedEntityId] || []
                        ))
                ) {
                    this._isAnyChangeInGoldenData = true;
                } else {
                    return;
                }

                //Del
                relationships.forEach(rel => {
                    let findRel = deletedRels.find(delRel => delRel.id == rel.id);
                    if (findRel) {
                        rel.action = 'delete';
                    }
                });

                //Add
                addedRels.forEach(addRel => {
                    let rel = {
                        id: `${relType}_${addRel.id}`,
                        direction: 'both',
                        relTo: {
                            id: addRel.id,
                            type: addRel.type
                        },
                        relationshipType: relType
                    };
                    relationships.push(rel);
                });

                let currentEntityRels = currentRelationships[data.id] || [];
                currentEntityRels.forEach(currRel => {
                    let findRel = relationships.find(
                        rel => (rel.relTo && rel.relTo.id == currRel.id) || rel.id == currRel.id
                    );
                    if (!findRel) {
                        currRel.action = 'delete';
                        relationships.push(currRel);
                    }
                });

                //Update relationships based on preview relationships
                if (!ObjectUtils.isEmpty(previewRelationships)) {
                    relationships.forEach(relationship => {
                        let previewRel = previewRelationships.find(
                            previewRel =>
                                previewRel.id == relationship.id ||
                                (previewRel.relTo && previewRel.relTo.id == relationship.id) ||
                                (relationship.relTo && relationship.relTo.id == previewRel.id) ||
                                (previewRel.relTo && relationship.relTo && previewRel.relTo.id == relationship.relTo.id)
                        );
                        if (previewRel) {
                            relationship['attributes'] = previewRel.attributes || {};
                            relationship['src'] = previewRel.src || '';
                        }
                    });
                }

                //Update relationship attributes
                this._manageRelationshipAttributesAndSource(
                    relationships,
                    data,
                    currentEntityRels,
                    entity.id == data.selectedColumnId
                );
                this._relationshipsAfterApprove[data.id] = relationships.filter(rel => rel.action != 'delete');

                // Add rels to entity rels
                if (!entity.data) {
                    entity.data = {};
                }
                if (!entity.data.relationships) {
                    entity.data.relationships = {};
                }
                entity.data.relationships[data.id] = relationships;
            }
        }, this);

        //Update relationships for context
        let dataContext = ContextUtils.getFirstDataContext(this.contextData);
        if (!ObjectUtils.isEmpty(dataContext) && entity.data.relationships) {
            if (!ObjectUtils.isEmpty(entity.data.contexts)) {
                entity.data.contexts[0].relationships = entity.data.relationships;
            } else {
                entity.data.contexts = [
                    {
                        context: dataContext,
                        relationships: entity.data.relationships
                    }
                ];
            }
            //Delete rels from self
            delete entity.data.relationships;
        }
    }

    /**
     * Simplify relationship attributes data for comparision
     */
    _formatRelationshipsData(relationships) {
        if (!ObjectUtils.isEmpty(relationships)) {
            return relationships.map(item => {
                let formattedRel = {};
                if (item.relTo) {
                    formattedRel = { id: item.relTo.id, type: item.relTo.type };
                }
                if (!ObjectUtils.isEmpty(item.attributes)) {
                    Object.keys(item.attributes).forEach(key => {
                        let attribute = item.attributes[key];
                        if (!ObjectUtils.isEmpty(attribute.values)) {
                            attribute.values.forEach(value => {
                                delete value.id;
                            });
                        }
                    });
                    formattedRel.attributes = item.attributes;
                }
                return formattedRel;
            });
        }
    }

    _compareRelationships(goldenRels, selectedRels) {
        let goldenRelationships = ObjectUtils.cloneObject(goldenRels);
        let selectedRelationships = ObjectUtils.cloneObject(selectedRels);
        let goldenRelToList = this._formatRelationshipsData(goldenRelationships);
        let selectedRelToList = this._formatRelationshipsData(selectedRelationships);
        return ObjectUtils.compareObjects(goldenRelToList, selectedRelToList);
    }

    _manageRelationshipAttributesAndSource(relationships, data, currentEntityRels, isSelectedAndMergeEntitiesAreSame) {
        if (ObjectUtils.isEmpty(relationships)) {
            return;
        }

        let selectedEntityOriginalRelationships = isSelectedAndMergeEntitiesAreSame
            ? currentEntityRels
            : data.relationshipObject[data.selectedEntityId];
        let relObjsForAttributes = [];
        if (
            ObjectUtils.isValidObjectPath(data, 'goldenAttribute.relationshipDetails.relationshipObjectsForAttributes')
        ) {
            relObjsForAttributes = data.goldenAttribute.relationshipDetails.relationshipObjectsForAttributes;
        }

        relationships.forEach(rel => {
            //Update Source
            if (rel.action != 'delete' && !ObjectUtils.isEmpty(selectedEntityOriginalRelationships)) {
                let foundRelInOriginalRels = selectedEntityOriginalRelationships.find(
                    selRel => selRel.id == rel.id || (selRel.relTo && selRel.relTo.id == rel.id)
                );
                if (foundRelInOriginalRels) {
                    rel.src = foundRelInOriginalRels.src;
                }
            }
            //Handle rel attr updated by QM
            if (!ObjectUtils.isEmpty(relObjsForAttributes)) {
                let foundQMUpdatedRel = relObjsForAttributes.find(relObj => relObj.id == rel.id);
                if (foundQMUpdatedRel && foundQMUpdatedRel.attributes) {
                    if (!rel.attributes) {
                        rel.attributes = {};
                    }
                    for (let attrName in foundQMUpdatedRel.attributes) {
                        rel.attributes[attrName] = foundQMUpdatedRel.attributes[attrName];
                    }
                }
            }
            //Update rel reference attributs
            this._updateRelationshipReferenceAttributes(rel.attributes);
            //Add rel attrs for delete
            this._addRelationshipAttributesForDelete(rel, currentEntityRels);
        });
    }

    _updateRelationshipReferenceAttributes(relationshipAttributes) {
        if (
            ObjectUtils.isEmpty(relationshipAttributes) ||
            ObjectUtils.isEmpty(this._relationshipReferenceAttributeNames)
        ) {
            return;
        }

        let valueContext = ContextUtils.getFirstValueContext(this.contextData);
        if (!valueContext) {
            valueContext = DALCommonUtils.getDefaultValContext();
        }

        for (let key in relationshipAttributes) {
            if (this._relationshipReferenceAttributeNames.indexOf(key) != -1) {
                if (relationshipAttributes[key] && relationshipAttributes[key].values) {
                    relationshipAttributes[key].values = relationshipAttributes[key].values.filter(
                        value => value.locale == valueContext.locale && value.source == valueContext.source
                    );
                }
            }
        }
    }

    //Manage relationship attributes based on current rel attributes
    _addRelationshipAttributesForDelete(relationship, currentEntityRels) {
        let foundInCurrentEntityRel = currentEntityRels.find(
            currRel => (currRel.relTo && currRel.relTo.id == relationship.id) || currRel.id == relationship.id
        );
        if (foundInCurrentEntityRel && !ObjectUtils.isEmpty(foundInCurrentEntityRel.attributes)) {
            if (!relationship.attributes) {
                relationship.attributes = {};
            }
            for (let attrName in foundInCurrentEntityRel.attributes) {
                if (!relationship.attributes[attrName]) {
                    relationship.attributes[attrName] = foundInCurrentEntityRel.attributes[attrName];
                    relationship.attributes[attrName].action = 'delete';
                }
            }
        }
    }

    async _getEntityCurrentRelationships(entity) {
        //Prepare rel get request
        let req = DataRequestHelper.createEntityGetRequest(this.contextData, true);
        delete req.params.fields.attributes;
        req.params.fields.relationships = !ObjectUtils.isEmpty(this._relationshipModels)
            ? Object.keys(this._relationshipModels)
            : ['_ALL'];
        req.params.fields.relationshipAttributes = ['_ALL'];
        req.params.fields.relatedEntityAttributes = this._getRelatedEntityAttributes();
        req.params.query.id = entity.id;
        let typesCriterion = [];
        typesCriterion.push(entity.type);
        req.params.query.filters.typesCriterion = typesCriterion;

        //Trigger entity get for latest rels
        let entityGetReqForRel = DataObjectManager.createRequest('getbyids', req, undefined, {
            objectsCollectionName: 'entities'
        });
        let entityGetRespForRel = await DataObjectManager.initiateRequest(entityGetReqForRel);

        let relationships = {};
        let dataContext = ContextUtils.getFirstDataContext(this.contextData);
        if (ObjectUtils.isValidObjectPath(entityGetRespForRel, 'response.content.entities')) {
            let entities = entityGetRespForRel.response.content.entities || [];
            if (entities.length) {
                if (ObjectUtils.isEmpty(dataContext)) {
                    relationships = ObjectUtils.isValidObjectPath(entities[0], 'data.relationships')
                        ? entities[0].data.relationships
                        : {};
                } else {
                    relationships = ObjectUtils.isValidObjectPath(entities[0], 'data.contexts.0.relationships')
                        ? entities[0].data.contexts[0].relationships
                        : {};
                }
            }
        }
        //Coalesced relationships not required for match merge
        if (!ObjectUtils.isEmpty(relationships)) {
            for (let relName in relationships) {
                if (relName && !ObjectUtils.isEmpty(relationships[relName]) && Array.isArray(relationships[relName])) {
                    relationships[relName] = relationships[relName].filter(rel => !rel.os || rel.os == 'graph');
                }
            }
        }
        return relationships;
    }

    _isItemInMissingModels(item, entity, isRelationship = false) {
        let isItemInMissingModels = false;

        if (!this._enforceManageModelForMerge || !entity) {
            return isItemInMissingModels;
        }

        if (entity.id) {
            let foundItem = item.itemMissingModelTypes.find(
                model => model.id == entity.id && model.type == entity.type
            );
            if (foundItem) {
                isItemInMissingModels = true;
            }
        } else {
            if (!this._isCreateProcessWithNoMatch && !ObjectUtils.isEmpty(this.matchedEntityIds)) {
                let foundItems = item.itemMissingModelTypes.filter(model => model.type == entity.type);
                let matchedEntitiesCount = this.entities.filter(
                    item => item.type == entity.type && this.matchedEntityIds.includes(item.id)
                ).length;
                if (foundItems.length == matchedEntitiesCount) {
                    isItemInMissingModels = true;
                }
            } else {
                if (this._allowedAttributesAndRelationships) {
                    let allowedItems = isRelationship
                        ? this._allowedAttributesAndRelationships.allowedRelationships
                        : this._allowedAttributesAndRelationships.allowedAttributes;
                    if (allowedItems && !allowedItems.includes(item.id)) {
                        isItemInMissingModels = true;
                    }
                }
            }
        }
        return isItemInMissingModels;
    }

    isAttributeAllowForSave(attr, isRepresentativeEntity) {
        let isAttributeAllowForSave = false;

        if (this._isItemInMissingModels(attr, isRepresentativeEntity)) {
            return isAttributeAllowForSave;
        }

        //When create, which all attributes having values should be in for save
        if (this._operation == 'create') {
            if (
                ObjectUtils.isValidObjectPath(attr, 'goldenAttribute.valueObject.value') &&
                !ObjectUtils.isEmpty(attr.goldenAttribute.valueObject.value)
            ) {
                isAttributeAllowForSave = true;
            }
        } else {
            //When update, which all attributes are different from selected entity should be in for save
            let selectedEntityObject = attr.attributeObject[this.selectedEntityId];
            if (!attr.goldenAttribute.valueObject) {
                attr.goldenAttribute.valueObject = {};
            }
            if (attr.goldenAttribute.isValueChanged || this._updatedAttributesList.indexOf(attr.attributeName) != -1) {
                isAttributeAllowForSave = true;
            } else if (
                attr.attributeModel.isCollection &&
                _.isArray(attr.goldenAttribute.valueObject.value) &&
                _.isArray(selectedEntityObject.value) &&
                !ArrayUtils.isEqual(attr.goldenAttribute.valueObject.value, selectedEntityObject.value)
            ) {
                isAttributeAllowForSave = true;
            } else if (
                !ObjectUtils.compareObjects(attr.goldenAttribute.valueObject.value, selectedEntityObject.value) ||
                !ObjectUtils.compareObjects(attr.goldenAttribute.valueObject.src, selectedEntityObject.src)
            ) {
                isAttributeAllowForSave = true;
            }
        }
        return isAttributeAllowForSave;
    }

    _updateAttributeForDelete(goldenAttribute, selectedEntityAttribute) {
        if (
            goldenAttribute.valueObject &&
            (goldenAttribute.valueObject.action == 'delete' || ObjectUtils.isEmpty(goldenAttribute.valueObject.value))
        ) {
            //Action delete and having value will occur if we add an item after delete
            if (!ObjectUtils.isEmpty(goldenAttribute.valueObject.value)) {
                let originalValue = ObjectUtils.cloneObject(goldenAttribute.originalValueObject.value);
                originalValue.forEach(val => {
                    val.action = 'delete';
                    goldenAttribute.valueObject.value.push(val);
                });
                delete goldenAttribute.valueObject.action;
            } else {
                //completeValue contains nested grid values when all values cleared, this helps to raise delete on actual values
                if (!ObjectUtils.isEmpty(goldenAttribute.completeValue)) {
                    goldenAttribute.valueObject.value = goldenAttribute.completeValue;
                } else {
                    if (!goldenAttribute.originalValueObject) {
                        goldenAttribute.originalValueObject = {};
                    }
                    goldenAttribute.valueObject.value = ObjectUtils.cloneObject(
                        goldenAttribute.originalValueObject.value
                    );
                }

                //If still value is blank, then set it as _EMPTY
                if (ObjectUtils.isEmpty(goldenAttribute.valueObject.value)) {
                    goldenAttribute.valueObject.value = '_EMPTY';
                }

                goldenAttribute.valueObject.action = 'delete'; //This is needed when value is empty
            }
        } else {
            //If attribute is nested attribute, then flush and fill doesn't work, so explicitly have to add "delete" action
            if (
                selectedEntityAttribute &&
                selectedEntityAttribute.model &&
                selectedEntityAttribute.model.dataType == 'nested'
            ) {
                let selectedEntityAttributeValue = selectedEntityAttribute.value;
                if (!ObjectUtils.isEmpty(this._previousChangedAttributeDetails)) {
                    let previousChangedAttr = this._previousChangedAttributeDetails.find(
                        changedAttr => changedAttr.name == selectedEntityAttribute.model.name
                    );
                    if (previousChangedAttr) {
                        let clonedPreviousChangedAttr = ObjectUtils.cloneObject(previousChangedAttr);
                        selectedEntityAttributeValue = clonedPreviousChangedAttr.value.filter(
                            val => val.action != 'delete'
                        );
                    }
                }
                if (!ObjectUtils.compareObjects(goldenAttribute.valueObject.value, selectedEntityAttributeValue)) {
                    selectedEntityAttributeValue.forEach(attrValue => {
                        attrValue.action = 'delete';
                        goldenAttribute.valueObject.value.unshift(attrValue);
                    });
                }
            }
        }
    }

    async _onCreateTap(e) {
        if (this.isCreateProcess && this.viewMode == 'recommendation') {
            let requestData = this._prepareEventRequest();
            let details = {
                operation: 'create',
                processEntity: this.sourceEntity,
                eventRequestData: requestData
            };
            this.fireBedrockEvent('on-match-merge-create', details);
        } else {
            this._loading = true;
            this._hideSourceCreate = true;
            let type = e.currentTarget.getAttribute('data-args');
            this._matchProcessType = type;
            let entity = await this._getEntityWithGoldenData();
            entity.type = MatchMergeHelper.getGREntityType(this._grmMappingConfig, this.sourceEntity.type);
            entity.id = 'e' + UniqueIdUtils.getRandomString();

            if (!ObjectUtils.isEmpty(entity)) {
                this._operation = 'create';
                this._saveEntity(entity);
            }
        }
    }

    //Draft link process
    _onLinkTap(e) {
        if (!ObjectUtils.isEmpty(this._isSourceOfRelationship)) {
            this._openLinkConfitmationDialog();
            return;
        }
        this._triggerLinkProcess();
    }

    _triggerLinkProcess(createdEntity) {
        let attrData = this._getGridDataAndSelectedEntityId(true);
        if (ObjectUtils.isEmpty(createdEntity) && attrData.selectedEntityId == this.sourceEntityId) {
            ToastManager.showWarningToast(this.localize('MatMerLnkMsg'));
            return;
        }
        let selectedEntity = !ObjectUtils.isEmpty(createdEntity)
            ? createdEntity
            : this.entities.find(entity => entity.id == attrData.selectedEntityId);
        let entity = ObjectUtils.cloneObject(this.sourceEntity);
        let potentialMatches = [];
        if (
            ObjectUtils.isValidObjectPath(
                this.sourceEntity,
                `data.relationships.${this._matchRelationshipNames['potentialmatches']}`
            )
        ) {
            potentialMatches = this.sourceEntity.data.relationships[this._matchRelationshipNames['potentialmatches']];
        }

        let relationship = {};
        let relType = this._matchRelationshipNames['issourceof'];
        //Prepare issourceof relationship
        if (selectedEntity) {
            relationship = {
                id: `${relType}_${selectedEntity.id}`,
                direction: 'both',
                relTo: {
                    id: selectedEntity.id,
                    type: selectedEntity.type
                },
                relationshipType: relType
            };
        }

        if (!ObjectUtils.isEmpty(relationship)) {
            let isSourceofRels = {};
            let relationships = [];

            if (ObjectUtils.isValidObjectPath(entity, `data.relationships.${relType}`)) {
                relationships = entity.data.relationships[relType] || [];
            }

            if (!relationships.find(rel => rel.relTo.id == relationship.relTo.id)) {
                relationships.push(relationship);
                this._triggerFeedbackEvent = true;
            }

            relationships = relationships.map(rel => {
                if (rel.relTo.id != relationship.relTo.id) {
                    rel.action = 'delete';
                }
                return rel;
            });

            isSourceofRels[relType] = relationships;
            entity.data = {
                relationships: isSourceofRels
            };

            //Remove potential Matches in the entityData while creating/Link&ManualMerge a GR
            if (
                (this._matchProcessType == 'createandlink' || this._matchProcessType == 'linkandmanualmerge') &&
                !ObjectUtils.isEmpty(potentialMatches)
            ) {
                //Add action delete to the potentialMatches
                potentialMatches = potentialMatches.map(rel => {
                    rel.action = 'delete';
                    return rel;
                });
                let pmRelType = this._matchRelationshipNames['potentialmatches'];
                entity.data.relationships[pmRelType] = potentialMatches;
            }

            if (this._matchProcessType != 'createandlink') {
                entity.data.attributes = this._getStateAttributes(
                    this._grmStates['inreview'],
                    this._grmStates['inreview']
                );
            }

            if (!ObjectUtils.isEmpty(entity)) {
                this._loading = true;
                this._isLinkProcess = true;
                this._operation = 'update';
                this._saveEntity(entity);
            }
        }
    }

    _updateEntityStateAttributes(grmState, grmProcessState) {
        //When source entity attributes are same, then no state attr update needed
        if (ObjectUtils.isValidObjectPath(this.sourceEntity, 'data.attributes')) {
            let sourceEntityAttributes = this.sourceEntity.data.attributes;
            let currentState = '';
            let currentProcessState = '';
            if (sourceEntityAttributes[this._grmAttributeNames.grmState]) {
                currentState = AttributeUtils.getFirstAttributeValue(
                    sourceEntityAttributes[this._grmAttributeNames.grmState]
                );
            }
            if (sourceEntityAttributes[this._grmAttributeNames.grmProcessState]) {
                currentProcessState = AttributeUtils.getFirstAttributeValue(
                    sourceEntityAttributes[this._grmAttributeNames.grmProcessState]
                );
            }

            if (currentState == grmState && currentProcessState == grmProcessState) {
                this._triggerProcessComplete();
                return;
            }
        }

        let entity = ObjectUtils.cloneObject(this.sourceEntity);
        entity.data = {
            attributes: this._getStateAttributes(grmState, grmProcessState)
        };
        if (!ObjectUtils.isEmpty(entity)) {
            this._loading = true;
            this._operation = 'update';
            this._saveEntity(entity);
        }
    }

    _triggerProcessComplete() {
        if (this._matchProcessType == 'discarded') {
            ToastManager.showSuccessToast(this.localize('TstNoCha'));
        } else {
            this._handleSaveResponse();
        }
    }

    _getStateAttributes(grmState, grmProcessState, grState) {
        let stateAttributes = {};
        let valueContext = DALCommonUtils.getDefaultValContext();

        stateAttributes[this._grmAttributeNames.grmState] = AttributeUtils.getEmptyValues([valueContext]);
        stateAttributes[this._grmAttributeNames.grmState].values[0].value = grmState || '';

        stateAttributes[this._grmAttributeNames.grmProcessState] = AttributeUtils.getEmptyValues([valueContext]);
        stateAttributes[this._grmAttributeNames.grmProcessState].values[0].value = grmProcessState || '';

        stateAttributes[this._grAttributeNames.grState] = AttributeUtils.getEmptyValues([valueContext]);
        stateAttributes[this._grAttributeNames.grState].values[0].value = grState || '';

        return stateAttributes;
    }

    //Link and Merge / Auto Merge
    _onLinkAndMerge(e) {
        let type = e.currentTarget.getAttribute('data-args');
        this._matchProcessType = type;

        if (
            !ObjectUtils.isEmpty(this._isSourceOfRelationship) &&
            (type == 'linkandautomerge' || type == 'linkandmanualmerge')
        ) {
            this._openLinkConfitmationDialog();
            return;
        }

        if (type == 'linkandautomerge' || type == 'automerge') {
            if (this.isGoldenDataDirty()) {
                this._autoMergeProcessTriggered = true;
                this._openDiscardChangesConfirmationDialog();
                return;
            }
        }

        if (type == 'automerge') {
            this._triggerAutoMergeProcess();
        } else {
            this._triggerLinkProcess();
        }
    }

    async _onApproveTap(e) {
        let type = e.currentTarget.getAttribute('data-args');
        this._matchProcessType = type || '';
        this._triggerApproveProcess();
    }

    async _triggerApproveProcess() {
        let entity = await this._getEntityWithGoldenData();

        let goldenRecord = this.entities.find(entity => entity.isRep);
        if (!this._isAnyChangeInGoldenData && goldenRecord.id != this.selectedEntityId) {
            ToastManager.showSuccessToast(this.localize('TstNoCha'));
            return;
        }

        //This is used to dirty check after approve
        let attrData = this._getGridDataAndSelectedEntityId(true);
        let attrDataRows = attrData.gridData;
        this._previousApprovedAttributeDetails = attrDataRows.filter(
            attr => attr.goldenAttribute.isValueChanged || attr.selectedEntityId != attrData.selectedEntityId
        );

        if (this.isCreateProcess) {
            let requestData = this._prepareEventRequest();
            let details = {
                operation: this._operation,
                selectedEntity: this.selectedEntityId,
                processEntity: entity,
                eventRequestData: requestData
            };
            this.fireBedrockEvent('on-match-merge-approve', details);
        } else {
            if (!ObjectUtils.isEmpty(entity)) {
                this._loading = true;
                this._saveEntity(entity);
            }
        }
    }

    /**
     * Auto merge does on preview data, not on golden data column changes
     * So comparision on preview value and selected entity value
     */
    _isAnyDataChangeInAutoMerge() {
        let isAnyChangeInData = false;
        let attrData = this._getGridDataAndSelectedEntityId(true);
        let attributesData = attrData.gridData;

        let relData = this._getGridDataAndSelectedEntityId();
        let relationshipData = relData.gridData;

        if (!ObjectUtils.isEmpty(attributesData)) {
            for (let data of attributesData) {
                let previewValue =
                    data.attributeModel && data.attributeModel.dataType == 'nested' && data.previewObject
                        ? data.previewObject.value
                        : data.previewValue;
                if (!ObjectUtils.compareObjects(previewValue, data[data.selectedEntityId])) {
                    isAnyChangeInData = true;
                    break;
                }
            }
        }

        if (!isAnyChangeInData && !ObjectUtils.isEmpty(relationshipData)) {
            for (let data of relationshipData) {
                let previewRels = this._getFormattedRels(data.previewValue);
                let entityRels = this._getFormattedRels(data[data.selectedEntityId]);
                if (!ObjectUtils.compareObjects(previewRels, entityRels)) {
                    isAnyChangeInData = true;
                    break;
                }
            }
        }

        return isAnyChangeInData;
    }

    /**
     * Format relationships for auto merge comparision
     */
    _getFormattedRels(relationships) {
        return (relationships || []).map(rel => {
            return {
                id: rel.id,
                relTo: {
                    id: rel.relTo.id,
                    type: rel.relTo.type
                }
            };
        });
    }

    async _triggerAutoMergeProcess() {
        if (!this._isAnyDataChangeInAutoMerge()) {
            let message = this.localize('TstNoCha');
            //Link has already happened, proceed with automerge for linkandautomerge use case
            if (this._matchProcessType != 'linkandautomerge') {
                ToastManager.showSuccessToast(message);
                return;
            }
        }

        let requestData = {
            params: {
                authorizationType: 'accommodate'
            },
            entity: {
                id: this.sourceEntity.id,
                type: this.sourceEntity.type
            }
        };
        //For link and automerge, sending the linked relationship in the request
        if (this._matchProcessType == 'linkandautomerge') {
            let sourceRelName = this._matchRelationshipNames['issourceof'];
            let entityData = {};
            let goldenRecord = this.entities.find(entity => entity.isRep);
            entityData['relationships'] = {};
            entityData['relationships'][sourceRelName] = [
                {
                    relTo: {
                        id: goldenRecord.id,
                        type: goldenRecord.type
                    }
                }
            ];
            if (requestData && requestData.entity) {
                requestData.entity.data = entityData;
            }
        }
        let defaultSelectedEntity = this._getDefaultSelectedEntity(this.entities);
        let clientStateInfo = NotificationHelper.prepareClientStateInfo(requestData);
        let notificationInfo = clientStateInfo.notificationInfo;
        if (notificationInfo) {
            if (notificationInfo.context) {
                notificationInfo.context.isMatchMerge = true;
                notificationInfo.context.id = defaultSelectedEntity.id;
                notificationInfo.context.type = defaultSelectedEntity.type;
                notificationInfo.context.dataIndex = 'entityData';
            }
            notificationInfo.source = 'ui';
            let userContext = ContextUtils.getFirstUserContext(this.contextData);
            if (userContext) {
                notificationInfo.userId = userContext.user;
            }
            requestData.clientState = clientStateInfo;
        }

        let url = '/data/pass-through/matchservice/automerge';
        let autoMergeResponse = await DataObjectManager.rest(url, requestData);
        if (autoMergeResponse.response && autoMergeResponse.response.status == 'success') {
            let entityTypeExternalName = this._getExternalEntityType(defaultSelectedEntity.type);
            let msg = this.localize('EntMerSucMsg', {
                entityName: defaultSelectedEntity.name,
                entityType: entityTypeExternalName
            });
            this._notificationAwaitTracker.push({
                id: defaultSelectedEntity.id,
                type: defaultSelectedEntity.type
            });
            this.sourceEntitiesData[this.reviewIndex].status = 'merged';
            if (this.isBulkProcess) {
                this._notifySourceEntities();
            }
            ToastManager.showSuccessToast(msg);
            //Start the notificationTimer when the auto merge process is completed
            this._startNotificationTimer();
        } else {
            LoggerManager.logError(this, 'Auto Merge failed', autoMergeResponse);
            this._loading = false;
        }
        this._autoMergeProcessTriggered = false;
    }

    async _triggerEventSaveRequest(requestData) {
        if (ObjectUtils.isEmpty(requestData)) {
            return;
        }
        let url = '/data/pass-through/eventservice/create';
        let matchFeedbackEventResponse = await DataObjectManager.rest(url, requestData);
        if (!matchFeedbackEventResponse.response || matchFeedbackEventResponse.response.status != 'success') {
            LoggerManager.logError(this, 'Match feedback event save failed', matchFeedbackEventResponse);
        }
    }

    _prepareEventRequest() {
        if (
            this._isMatchFeedbackCollectionEnabled &&
            (this.matchType == 'mlbased' || (this._enableFeedbackCollection && this._triggerFeedbackEvent))
        ) {
            let eventId = 'matchfeedbackevent_' + UniqueIdUtils.getRandomString();
            let eventAttributes = {};
            let req = {
                event: {
                    id: eventId,
                    type: 'matchfeedbackevent',
                    data: {
                        attributes: eventAttributes
                    }
                }
            };

            let valueContext = ContextUtils.getFirstValueContext(this.contextData);
            if (!valueContext) {
                valueContext = DALCommonUtils.getDefaultValContext();
            }

            let matchResults = [];
            if (!ObjectUtils.isEmpty(this._mlBasedResults.createOrMergeList)) {
                matchResults = this._mlBasedResults.createOrMergeList;
            } else if (!ObjectUtils.isEmpty(this._mlBasedResults.mergeList)) {
                matchResults = this._mlBasedResults.mergeList;
            } else if (!ObjectUtils.isEmpty(this._mlBasedResults.createList)) {
                matchResults = this._mlBasedResults.createList;
            }

            let matchedEntitiesData = [];
            if (!ObjectUtils.isEmpty(this._mlBasedResults.matchedEntitiesData)) {
                matchedEntitiesData = this._mlBasedResults.matchedEntitiesData;
            } else if (!ObjectUtils.isEmpty(this.matchedEntitiesData)) {
                matchedEntitiesData = this.matchedEntitiesData;
            }

            //Suspect entity data from match search with threshold filter
            let sortedCreateOrMergeList = _.sortBy(matchResults, 'score').reverse();
            let createOrMergeEntityData = [];
            sortedCreateOrMergeList.forEach((entity, idx) => {
                if (idx < this.matchEntitiesLimit) {
                    let foundMatchData = matchedEntitiesData.find(matchData => matchData.id == entity.id);
                    if (foundMatchData) {
                        createOrMergeEntityData.push(foundMatchData);
                    }
                } else return;
            });

            //Selected entity details
            let selectedEntityId = this.selectedEntityId;
            if (this._operation != 'create' && !ObjectUtils.isEmpty(this.entities)) {
                let repEntity = this.entities.find(entity => entity.isRep);
                if (!ObjectUtils.isEmpty(repEntity)) {
                    selectedEntityId = repEntity.id;
                }
            }

            //Recommendation View - Not found the selected entity in the event list, then add here
            if (selectedEntityId && !createOrMergeEntityData.find(entity => entity.id == selectedEntityId)) {
                let foundSelectedEntity = matchedEntitiesData.find(entity => entity.id == selectedEntityId);
                if (foundSelectedEntity) {
                    createOrMergeEntityData = createOrMergeEntityData.slice(0, createOrMergeEntityData.length - 1);
                    createOrMergeEntityData.push(foundSelectedEntity);
                }
            }

            if (this.sourceEntity && !(this.isCreateProcess && this._operation == 'update')) {
                eventAttributes['identifier'] = AttributeUtils.getEmptyValues([valueContext]);
                eventAttributes['identifier'].values[0].value = this.sourceEntity.id || '';
            }
            eventAttributes['entityType'] = AttributeUtils.getEmptyValues([valueContext]);
            eventAttributes['entityType'].values[0].value = this.sourceEntity.type || '';
            eventAttributes['tenantId'] = AttributeUtils.getEmptyValues([valueContext]);
            eventAttributes['tenantId'].values[0].value = this.tenantId || '';
            eventAttributes['eventType'] = AttributeUtils.getEmptyValues([valueContext]);
            eventAttributes['eventType'].values[0].value = 'MATCH_PROCESS';
            eventAttributes['eventSubType'] = AttributeUtils.getEmptyValues([valueContext]);
            eventAttributes['eventSubType'].values[0].value = 'MATCH_FEEDBACK_COLLECTION';
            eventAttributes['modelversion'] = AttributeUtils.getEmptyValues([valueContext]);
            eventAttributes['modelversion'].values[0].value = this._modelVersion;
            eventAttributes['matchstatus'] = AttributeUtils.getEmptyValues([valueContext]);
            eventAttributes['matchstatus'].values[0].value =
                this._operation == 'create' || this._matchProcessType == 'createandlink' ? 'nomatch' : 'match';

            //Source entity, formatted source entity details come from match get
            if (ObjectUtils.isValidObjectPath(this._transformedSourceEntity, 'data.attributes')) {
                let sourceAttributes = this._transformedSourceEntity.data.attributes;
                for (let attrName in sourceAttributes) {
                    eventAttributes[attrName] = {
                        values: sourceAttributes[attrName].values
                    };
                }
            }

            if (!ObjectUtils.isEmpty(createOrMergeEntityData)) {
                let clusterGroup = [];
                createOrMergeEntityData.forEach(entity => {
                    let entObj = entity.data && entity.data.attributes ? entity.data.attributes : {}; //Collect attributes as-is from matched entities
                    entObj.source = valueContext.source;
                    entObj.locale = valueContext.locale;

                    //Add match status
                    let matchStatus = 'nomatch';
                    if (this._operation != 'create' && entity.id == selectedEntityId) {
                        matchStatus = 'match';
                    }
                    entObj['suspectstatus'] = AttributeUtils.getEmptyValues([valueContext]);
                    entObj['suspectstatus'].values[0].value = matchStatus;

                    entObj['entityType'] = AttributeUtils.getEmptyValues([valueContext]);
                    entObj['entityType'].values[0].value = entity.type || '';

                    clusterGroup.push(entObj);
                });
                eventAttributes.clusters = {
                    group: clusterGroup,
                    source: valueContext.source,
                    locale: valueContext.locale
                };
            }

            return req;
        }
    }

    async _onSendForReviewTap(e) {
        this._isReviewEntity = true;
        let entity = await this._getEntityWithGoldenData();
        if (this.isCreateProcess) {
            let details = {
                operation: this._operation,
                selectedEntity: this.selectedEntityId,
                processEntity: entity,
                isReviewEntity: true
            };
            this.fireBedrockEvent('on-match-merge-review', details);
        }
    }

    _deleteDraftEntity() {
        this._operation = 'delete';
        this._saveRequest = {
            entities: [
                {
                    id: this.sourceEntity.id,
                    type: this.sourceEntity.type,
                    name: this.sourceEntity.name
                }
            ]
        };
        this._triggerSaveRequest();
    }

    _finishEntityReview() {
        if (this.isBulkProcess) {
            this._moveToNextEntity();
        } else {
            PubSubManager.fireCustomEvent('cancel-event', null, this);
        }
    }

    async _triggerGovernRequest() {
        let governReq = {
            entity: ObjectUtils.cloneObject(this._saveRequest.entities[0])
        };
        let entityGovernResponse = await this._fetchDetails(
            governReq,
            '/data/pass-through/entitygovernservice/validate'
        );
        this._handleEntityGovernResponse(entityGovernResponse);
    }

    _handleEntityGovernResponse(entityGovernResponse) {
        if (
            entityGovernResponse &&
            entityGovernResponse.response &&
            (entityGovernResponse.response.status || '').toLowerCase() == 'success'
        ) {
            let res = entityGovernResponse.response;
            let entityId = '';
            if (ObjectUtils.isValidObjectPath(entityGovernResponse, 'request.requestData.entity.id')) {
                entityId = entityGovernResponse.request.requestData.entity.id;
            }

            let entity = EntityUtils.findById(res.entities, entityId);
            let attrMessages = {};
            if (entity && entity.data && entity.data.attributes) {
                let attributes = entity.data.attributes;
                attrMessages = MessageHelper.getAttributeMessages(
                    attributes,
                    this._attributeModels,
                    this.messageCodeMapping,
                    false
                );
            }
            if (!ObjectUtils.isEmpty(attrMessages)) {
                let errorMessages = MessageHelper.getErrorsFromAttrMessages(attrMessages, this._attributeModels);
                this._syncValidationErrors = errorMessages;
                this.shadowRoot.querySelector('#errorsDialog').open();
                return;
            } else {
                this._triggerSaveRequest();
            }
        } else {
            this._loading = false;
            LoggerManager.logError(this, 'There is a problem in validation service.', entityGovernResponse);
        }
    }

    _closeErrorDialog() {
        let errorDialog = this.shadowRoot.querySelector('#errorsDialog');
        if (errorDialog) {
            errorDialog.close();
        }
    }

    _skipServerErrors() {
        this._closeErrorDialog();
        this._triggerSaveRequest();
    }

    _fixServerErrors() {
        this._closeErrorDialog();
        this._loading = false;
    }

    async _triggerSaveRequest() {
        let notificationInfoObj = NotificationHelper.prepareClientStateInfo(this._saveRequest);
        if (ObjectUtils.isValidObjectPath(notificationInfoObj, 'notificationInfo.context')) {
            notificationInfoObj.notificationInfo.context.isMatchMerge = true;
        }
        let options = {
            objectsCollectionName: 'entities',
            validateRequest: false,
            clientStateInfo: notificationInfoObj,
            dataIndex: 'entityData'
        };

        //Capture entities for notification resolving
        if (ObjectUtils.isValidObjectPath(this._saveRequest, 'entities.0')) {
            let entity = this._saveRequest.entities[0];
            this._notificationAwaitTracker.push({
                id: entity.id,
                type: entity.type
            });
        }

        let entitySaveReq = DataObjectManager.createRequest(this._operation, this._saveRequest, undefined, options);
        let entitySaveResponse = await DataObjectManager.initiateRequest(entitySaveReq);

        if (!entitySaveResponse || !entitySaveResponse.response || entitySaveResponse.response.status != 'success') {
            this._handleSaveError(entitySaveResponse);
            return;
        }

        this._handleSaveResponse(entitySaveResponse);
    }

    _onStatusUpdate() {
        let entityTypeExternalName = this._getExternalEntityType(this.sourceEntity.type);
        let msg = this.localize('EntDisSucMsg', { entityType: entityTypeExternalName });
        this._matchProcessType = 'discarded';
        this._triggerUpdateEntityStateAttributes(msg, 'discarded');
    }

    _triggerUpdateEntityStateAttributes(msg, status) {
        this._processMessage = msg;
        this._processStatus = status;
        this._processFinished = true;

        if (!this.isGRMV2Flow || this.isCompareProcess) {
            this._triggerProcessComplete();
            return;
        }

        let grmState = this._grmStates['inreview'];
        let grmProcessState = this._grmStates['inreview'];
        let grState = '';
        if (this._matchProcessType == 'createandlink') {
            grmState = this._grmStates['done'];
            grmProcessState = this._grmStates['manualcreated'];
        } else if (
            this._matchProcessType == 'automerge' ||
            (this._matchProcessType == 'linkandautomerge' && this._processStatus != 'linked')
        ) {
            grmState = this._grmStates['done'];
            grmProcessState = this._grmStates['automerged'];
        } else if (this._matchProcessType == 'manualmerge' || this._matchProcessType == 'linkandmanualmerge') {
            grmState = this._grmStates['done'];
            grmProcessState = this._grmStates['manualmerged'];
        } else if (this._matchProcessType == 'discarded') {
            grmState = this._grmStates['done'];
            grmProcessState = this._grmStates['discarded'];
        } else if (this._matchProcessType == 'unmerge') {
            grmState = this._grmStates['done'];
            grmProcessState = this._grmStates['unmerged'];
            grState = this._grStates['recompute'];
            this._updateEntitiesAttributesWhenUnmerge(grmState, grmProcessState, grState);
            return;
        }
        this._updateEntityStateAttributes(grmState, grmProcessState, grState);
    }

    _updateEntitiesAttributesWhenUnmerge(grmState, grmProcessState, grState) {
        let sourceRecord = this.entities.find(entity => entity.id == this._unmergeColumnId);
        let goldenRecord = this.entities.find(entity => entity.isRep);

        if (this._isOwnedProcess) {
            sourceRecord = ObjectUtils.cloneObject(this.sourceEntity);
        }

        let updateEntities = [];
        sourceRecord.data = {
            attributes: this._getStateAttributes(grmState, grmProcessState, '')
        };
        goldenRecord.data = {
            attributes: this._getStateAttributes('', '', grState)
        };
        updateEntities.push(sourceRecord, goldenRecord);

        if (!ObjectUtils.isEmpty(updateEntities)) {
            this._loading = true;
            this._operation = 'update';
            this._saveEntity(updateEntities);
        }
    }

    _resetProcess() {
        this._processMessage = '';
        this._processStatus = '';
        this._processFinished = false;
        this._matchProcessType = '';
    }

    async _handleSaveResponse(entitySaveResponse) {
        let operation = entitySaveResponse && entitySaveResponse.request ? entitySaveResponse.request.operation : '';
        let msg = '';
        let status = '';
        let entity = {};

        //processed entity
        if (ObjectUtils.isValidObjectPath(entitySaveResponse, 'request.requestData.entities.0')) {
            entity = entitySaveResponse.request.requestData.entities[0];
        }

        let entityTypeExternalName = this._getExternalEntityType(entity.type);

        //processFinished - Used to ignore grmstate attribute updates
        if (!this._processFinished) {
            if (operation == 'create') {
                msg = this.localize('EntCreSucMsg', { entityName: entity.name, entityType: entityTypeExternalName });
                this._createdEntity = {
                    id: entity.id,
                    source: this.sourceEntity
                };
                if (ObjectUtils.isEmpty(this._matchProcessType)) {
                    status = 'created';
                } else {
                    if (this._matchProcessType == 'createandlink') {
                        this._triggerLinkProcess({
                            id: entity.id,
                            type: entity.type
                        });
                        msg = '';
                        return;
                    }
                }
            } else if (operation == 'update') {
                //Get the permission denied messages for linking & attr/relationship update
                if (ObjectUtils.isValidObjectPath(entitySaveResponse, 'response.statusDetail')) {
                    let entitiesStatusDetails = entitySaveResponse.response.statusDetail;
                    let selectedEntities = [];
                    let deniedEntities = {};
                    let attributeModels = this._models.attributeModels;
                    let relationshipModels = {};
                    for (let key in this._models.relationshipModels) {
                        relationshipModels[key] = this._models.relationshipModels[key][0];
                    }
                    for (const property in entitiesStatusDetails) {
                        let deniedEntity = LiquidResponseUtils.getDynamicResponseMessages(
                            entitySaveResponse.response,
                            property,
                            attributeModels,
                            relationshipModels
                        );
                        deniedEntities[property] = deniedEntity;
                        selectedEntities.push({ id: property, type: deniedEntity.type });
                    }

                    if (!ObjectUtils.isEmpty(selectedEntities)) {
                        let selectedEntityId = selectedEntities[0].id;
                        this.showPermisionDenied = true;
                        if (this._isLinkProcess && deniedEntities[selectedEntityId]['relationship']) {
                            //Linking will result in relationship denied only
                            this._erroredEntities = await EntityOperationManager.getPermissionDeniedErrorsGridFormat(
                                selectedEntities,
                                deniedEntities,
                                'relationship'
                            );
                            this._messageGridDialogErrorMsg = this.localize('RelSavFaiMsg');
                            this._messageGridDialogTitle = this.localize('LinRTTT');
                        } else {
                            //Get  the attributes and relationships errors
                            let erroredAttributes = [];
                            let erroredRelationships = [];
                            if (!ObjectUtils.isEmpty(deniedEntities[selectedEntityId]['attribute'])) {
                                erroredAttributes = await EntityOperationManager.getPermissionDeniedErrorsGridFormat(
                                    selectedEntities,
                                    deniedEntities,
                                    'attribute'
                                );
                                //Add relationship field to be shown in the permission denied grid attr/rel column
                                erroredAttributes.forEach(result => {
                                    result.relationship = result.attribute;
                                });
                            }
                            if (!ObjectUtils.isEmpty(deniedEntities[selectedEntityId]['relationship'])) {
                                erroredRelationships = await EntityOperationManager.getPermissionDeniedErrorsGridFormat(
                                    selectedEntities,
                                    deniedEntities,
                                    'relationship'
                                );
                            }

                            //Concatinating the errored attributes and relationships
                            this._erroredEntities = [...erroredAttributes, ...erroredRelationships];
                            this._messageGridDialogErrorMsg = this.localize('AttrRelSavFaiMsg');
                            if (this._matchProcessType == 'unmerge') {
                                this._messageGridDialogTitle = this.localize('UnMerTxt');
                                this._messageGridDialogSuccessMsg = this.localize('UnMerRelSucMsg');
                            } else {
                                if (this._matchProcessType == 'linkandmanualmerge') {
                                    this._messageGridDialogTitle = this.localize('LnkManMerTxt');
                                } else if (this._matchProcessType == 'manualmerge') {
                                    this._messageGridDialogTitle = this.localize('ManMerTxt');
                                }
                                this._messageGridDialogSuccessMsg = this.localize('EntMerSucMsg', {
                                    entityName: entity.name,
                                    entityType: entityTypeExternalName
                                });
                            }
                        }

                        let errorDialog = this.shadowRoot.querySelector('rock-message-grid');
                        errorDialog.showErrorDialog();

                        //If linking has failed return
                        if (this._isLinkProcess) {
                            this._loading = false;
                            return;
                        }
                    }
                }

                if (this._createdEntity.id == entity.id) {
                    msg = this.localize('EntUpdSucMsg', {
                        entityName: entity.name,
                        entityType: entityTypeExternalName
                    });
                    status = 'created'; //Actual status is created and the same entity updated here
                } else {
                    if (this._isLinkProcess) {
                        this._isLinkProcess = false;
                        msg = this.localize('EntLnkSucMsg', {
                            entityName: entity.name,
                            entityType: entityTypeExternalName
                        });
                        if (ObjectUtils.isEmpty(this._matchProcessType)) {
                            status = 'linked';
                        } else {
                            if (this._matchProcessType == 'createandlink') {
                                let grEntityType = MatchMergeHelper.getGREntityType(
                                    this._grmMappingConfig,
                                    entity.type
                                );
                                if (grEntityType) {
                                    entityTypeExternalName = this._getExternalEntityType(grEntityType);
                                }
                                msg = this.localize('EntCreSucMsg', {
                                    entityName: entity.name,
                                    entityType: entityTypeExternalName
                                });
                                status = 'created';
                                this._triggerUpdateEntityStateAttributes(msg, status);
                                return;
                            }
                            if (this._matchProcessType == 'linkandmanualmerge') {
                                await this._triggerApproveProcess();
                                msg = '';
                                return;
                            } else if (this._matchProcessType == 'linkandautomerge') {
                                this._loading = false;
                                this._waitForLinkProcessSave = true;
                                msg = '';
                                return;
                            }
                        }
                    } else {
                        if (this._matchProcessType == 'unmerge') {
                            status = 'unmerge'; //New status
                            msg = this.localize('UnMerRelSucMsg');
                        } else {
                            msg = this.localize('EntMerSucMsg', {
                                entityName: entity.name,
                                entityType: entityTypeExternalName
                            });
                            status = 'merged';
                        }
                        //Do not show the toast messsage if permission denied dialog is shown, as this message is displayed there already
                        if (this.showPermisionDenied) {
                            msg = '';
                        }
                        this._triggerUpdateEntityStateAttributes(msg, status);
                        return;
                    }
                }
            } else if (operation == 'delete') {
                msg = this.localize('EntDelSucMsg', { entityName: entity.name, entityType: entityTypeExternalName });
                status = 'deleted';
            }
        } else if (
            this._processFinished &&
            (this._matchProcessType == 'linkandmanualmerge' ||
                this._matchProcessType == 'createandlink' ||
                this._matchProcessType == 'manualmerge' ||
                this._matchProcessType == 'unmerge')
        ) {
            //Start the notificationTimer when the process is completed for create/linkandmanualmerge/manualmerge/unmerge
            this._startNotificationTimer();
        }

        //If event details available, then save the event
        if (this._isMatchFeedbackCollectionEnabled) {
            let requestData = this._prepareEventRequest();
            await this._triggerEventSaveRequest(requestData);
            this._triggerFeedbackEvent = false;
        }

        msg = msg || this._processMessage;
        status = status || this._processStatus;
        this._resetProcess();

        this.sourceEntitiesData[this.reviewIndex].status = status;
        if (this.isBulkProcess) {
            this._notifySourceEntities();
        }

        setTimeout(() => {
            this._loading = false;
            if (msg) {
                ToastManager.showSuccessToast(msg);
            }
            this.updateRelationshipGrid(entity);

            if (this._isDiscardProcess && operation == 'delete') {
                this._finishEntityReview();
            }
        }, 100);
    }

    _handleSaveError(entitySaveResponse) {
        let operation = entitySaveResponse.request.operation;
        let msg = '';
        this._loading = false;
        this._hideSourceCreate = false;
        LoggerManager.logError(this, 'Failed to update entity', entitySaveResponse);

        if (ObjectUtils.isValidObjectPath(entitySaveResponse, 'response.statusDetail.detail.0.value.messageCode')) {
            let messageCode = entitySaveResponse.response.statusDetail.detail[0].value.messageCode;
            if (operation == 'delete') {
                if (messageCode == 'PD001') {
                    msg = this.localize('TstDelEntDen');
                    LoggerManager.logError(this, 'You do not have permission to delete an entity!', entitySaveResponse);
                } else {
                    msg = this.localize('TstDelEntFai');
                    LoggerManager.logError(this, 'Failed to perform delete on the entity', entitySaveResponse);
                }
            } else if (operation == 'create') {
                if (messageCode == 'E0323') {
                    msg = this.localize('EntMatFouWar');
                    LoggerManager.logError(this, 'Failed to create an entity', entitySaveResponse);
                }
            } else if (operation == 'update') {
                if (messageCode == 'PD001') {
                    msg = this.localize('TstEdiEntDen');
                    LoggerManager.logError(this, 'You do not have permission to update an entity!', entitySaveResponse);
                }
            }

            if (messageCode == 'E0830') {
                msg = this.localize('TenPolProFaiMsg');
                LoggerManager.logError(this, 'Failed due to tenant policy', entitySaveResponse);
            }

            if (ObjectUtils.isEmpty(msg) && !ObjectUtils.isEmpty(messageCode)) {
                msg = this.localize(messageCode);
            }
        } else {
            msg = this.localize('EntProFai');
        }

        ToastManager.showErrorToast(msg);
    }

    _allowAction(type) {
        let allowAction = false;
        if (EntityUtils.hasWritePermission(this.contextData)) {
            if (type == 'approve') {
                if (this._showMessageOnly) {
                    return false;
                }
                if (this.viewMode != 'recommendation') {
                    allowAction = this.isCreateProcess
                        ? this.showMergeButton && this._canMerge && !this._showDiscard
                        : this.showMergeButton && this._canMerge;
                }
            } else if (type == 'review') {
                allowAction =
                    this.isCreateProcess && !this._canMerge && !this._showDiscard && this.viewMode != 'recommendation';
            } else if (type == 'discard') {
                allowAction =
                    this._showDiscard &&
                    !this._isWhereusedProcess &&
                    this.viewMode != 'recommendation' &&
                    this.matchType != 'deterministic' &&
                    !this.isCreateProcess;
            } else if (type == 'link') {
                allowAction = this._canMerge && this.viewMode != 'recommendation';
            }
        }

        //Recommendation view Create / Update actions display
        if (this.isCreateProcess && this.viewMode == 'recommendation' && this.matchType != 'deterministic') {
            if (type == 'update' && this.allowUpdate && this._hasReadPermission) {
                allowAction = true;
            }

            if (type == 'create' && this._allowCreate) {
                allowAction = true;
            }
        }

        return allowAction;
    }

    _reset() {
        this._attributeGridConfig = {};
        this._attributeGridData = this._attributeData = [];
        this._relationshipGridData = this._relationshipData = [];
        this._syncValidationErrors = [];
        this.attributeMessages = {};
        this._combinedEntitySetForRender = [];
        this._entityModels = [];
        this._attributeModels = {};
        this._relationshipModels = {};
        this._matchProcessMessage = '';
        this._showMessageOnly = false;
        this.hideDataFilter = false;
        this._showAttributePermissionDeniedMessage = false;
        this._showRelationshipPermissionDeniedMessage = false;
        this.enableColumnSelect = true;
        this._noMatchesFound = false;
        this.selectedEntityId = '';
        this._isReviewEntity = false;
        this._isRelationshipProcess = false;
        this._isWhereusedProcess = false;
        this._isOwnedProcess = false;
        this._isLinkProcess = false;
        this._updatedAttributesList = [];
        this._previousChangedAttributeDetails = {};
        this._previousApprovedAttributeDetails = [];
        this._isNextActionTriggered = false;
        this._hasReadPermission = true;
        this._matchedEntity = {};
        if (
            this._createdEntity &&
            this._createdEntity.source &&
            this.sourceEntity.id != this._createdEntity.source.id
        ) {
            this._createdEntity = {};
        }
        this._canCreate = this._canMerge = this._showDiscard = this._isDiscardProcess = false;
        this._clearFilters();
        let pebbleDropDown = this.shadowRoot.querySelector('#actionsButton');
        if (pebbleDropDown) {
            pebbleDropDown.selectedIndex = 0;
        }
        this._notificationAwaitTracker = [];
        this._waitForLinkProcessSave = false;
        this._isInitialDataLoad = true;
        this._isMaxLimitExceedMessage = false;
    }

    _clearFilters() {
        this._clearFilter(true); //isAttribute grid as true
        this._clearFilter(); //relationship grid
    }

    _clearFilter(isAttribute) {
        let mergeGrid = this._getMergeGrid(!isAttribute);

        if (mergeGrid) {
            if (ObjectUtils.isValidObjectPath(mergeGrid, 'gridOptions.api.setQuickFilter')) {
                mergeGrid.gridOptions.api.setQuickFilter('');
                mergeGrid.gridOptions.api.valueFilter = '';
                mergeGrid.gridOptions.api.groupValueFilter = '';
                //Clear filter text
                let filterCell = mergeGrid.shadowRoot.querySelector('filter-cell');
                if (filterCell) {
                    filterCell.text = '';
                    if (ObjectUtils.isValidObjectPath(filterCell, 'params.column.colDef.filterText')) {
                        filterCell.params.column.colDef.filterText = '';
                    }
                }
            }
        }
    }

    _reviewEntitiesCount(entities, status, sourceEntities) {
        let reviewEntities = [];
        if (status !== 'pending') {
            reviewEntities = entities.filter(entity => {
                return entity.status === status;
            });
            return reviewEntities.length;
        } else {
            /** Pending = Get non-pending entities & diff that from all entities */
            reviewEntities = entities.filter(entity => {
                return entity.status !== status;
            });
            return sourceEntities.length - reviewEntities.length;
        }
    }

    _onDelete() {
        if (this.isCreateProcess) {
            this._reset();
            this.fireBedrockEvent('on-match-merge-discard', null);
            return;
        }
        if (this.sourceEntitiesData[this.reviewIndex].status == 'deleted') {
            return;
        }
        let deleteConfirmationDialog = this.shadowRoot.querySelector('#deleteConfirmDialog');
        if (deleteConfirmationDialog) {
            deleteConfirmationDialog.open();
        }
    }

    _triggerDeleteProcess() {
        this._cancelDeleteProcess();
        this._isDiscardProcess = true;
        this._deleteDraftEntity();
    }

    _cancelDeleteProcess() {
        let deleteConfirmDialog = this.shadowRoot.querySelector('#deleteConfirmDialog');
        if (deleteConfirmDialog) {
            deleteConfirmDialog.close();
        }
    }

    //Unmerge isSource Realeastionship
    _onUnmergeIsSourceofRel(e) {
        let unmergeIsSourceRelConfirmationDialog = this.shadowRoot.querySelector('#unmergeIsSourceRelConfirmDialog');
        if (ObjectUtils.isValidObjectPath(e, 'detail.data.columnId')) {
            this._unmergeColumnId = e.detail.data.columnId;
        }
        if (unmergeIsSourceRelConfirmationDialog) {
            unmergeIsSourceRelConfirmationDialog.open();
        }
    }

    _triggerUnmergeIsSourceRelProcess() {
        this._cancelUnmergeIsSourceRelProcess();
        this._unmergeIsSourceRelationship();
    }

    _cancelUnmergeIsSourceRelProcess() {
        let unmergeIsSourceRelConfirmationDialog = this.shadowRoot.querySelector('#unmergeIsSourceRelConfirmDialog');
        if (unmergeIsSourceRelConfirmationDialog) {
            unmergeIsSourceRelConfirmationDialog.close();
        }
    }

    _unmergeIsSourceRelationship() {
        let relType = this._matchRelationshipNames['issourceof'];
        let updateEntity = this.entities.find(entity => entity.id == this._unmergeColumnId);

        let isSourceofRels = {};
        let relationships = [];
        if (this._isOwnedProcess) {
            updateEntity = ObjectUtils.cloneObject(this.sourceEntity);

            if (ObjectUtils.isValidObjectPath(updateEntity, `data.relationships.${relType}`)) {
                relationships = updateEntity.data.relationships[relType] || [];
            }
            relationships = relationships.map(rel => {
                rel.action = 'delete';
                return rel;
            });
        } else if (this._isWhereusedProcess) {
            let goldenRecord = this.entities.find(entity => entity.isRep === true);
            relationships.push({
                relTo: {
                    id: goldenRecord.id,
                    type: goldenRecord.type
                },
                action: 'delete'
            });
        }
        if (!ObjectUtils.isEmpty(relationships)) {
            isSourceofRels[relType] = relationships;
            updateEntity.data = {
                relationships: isSourceofRels
            };
        }
        if (!ObjectUtils.isEmpty(updateEntity)) {
            this._loading = true;
            this._matchProcessType = 'unmerge';
            this._operation = 'update';
            this._saveEntity(updateEntity);
        }
    }
    //end Unmerge relationship

    _onFlipSource(e) {
        if (!ObjectUtils.isValidObjectPath(e, 'detail.data.columnId')) {
            return;
        }
        let entityId = e.detail.data.columnId;
        let selectedEntity = this.entities.find(entity => entity.id == entityId);

        let clonedContextData = ObjectUtils.cloneObject(this._contextData);
        clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM][0].type = selectedEntity.id;
        clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM][0].id = selectedEntity.type;
        let appContexts = ContextUtils.getAppContexts(clonedContextData);

        if (ObjectUtils.isEmpty(appContexts)) {
            let appName = AppInstanceManager.getCurrentActiveAppName();
            if (appName) {
                clonedContextData[ContextUtils.CONTEXT_TYPE_APP] = [
                    {
                        app: appName
                    }
                ];
            }
        }
        let matchEntitiesContextId = UniqueIdUtils.getRandomId();
        let matchEntititesContextData = {
            isCompareProcess: false,
            sourceEntities: [selectedEntity],
            contextData: clonedContextData
        };
        sessionStorage.setItem(matchEntitiesContextId, JSON.stringify(matchEntititesContextData));
        let state = {
            matchEntitiesContextId: matchEntitiesContextId
        };
        this.state = state;
        AppInstanceManager.setQueryParamsWithoutEncode({ state: this.getQueryParamFromState() });
        let mainApp = OSElements.mainApp;
        if (mainApp) {
            mainApp.changePageRoutePath('match-merge');
        }
    }

    _getExternalEntityType(entityTypeId) {
        return EntityTypeManager.getTypeExternalNameById(entityTypeId);
    }

    _triggerContextChangeProcess() {
        this._currentDimensions = {
            original: ObjectUtils.cloneObject(this._selectedDimensions),
            transformed: ObjectUtils.cloneObject(this._newDimensions)
        };
        ContextUtils.updateContextData(this.contextData, this._newDimensions);
        this._isContextChanged = true;
        this._onContextChanged();
    }

    async _triggerDiscardChangesProcess() {
        if (this._isNextActionTriggered) {
            this._triggerMoveNext();
        } else if (this._mergePreviewToggleChangeTriggered) {
            await this._triggerMergePreviewToggleChange();
        } else if (this._potentialMatchesFlagChangeTriggered) {
            this._triggerPotentialMatchesFlagChange();
        } else if (this._autoMergeProcessTriggered) {
            if (this._matchProcessType == 'linkandautomerge') {
                await this._triggerLinkProcess();
            } else {
                await this._triggerAutoMergeProcess();
            }
        } else {
            this._triggerContextChangeProcess();
        }
    }

    _resetContextSelection() {
        let action = this.aci.createAction({
            name: 'reset-context-selection',
            detail: {
                dimensions: this._isNextLoad ? this._initialContextData : this._selectedDimensions
            }
        });
        this.aci.dispatch(action);
    }

    _cancelDiscardChangesProcess() {
        if (this._potentialMatchesFlagChangeTriggered) {
            if (this.potentialMatchesFlagEl) {
                this.potentialMatchesFlagEl.checked = !this.potentialMatchesFlagEl.checked;
            }
        }
        //reset actions
        this._isNextActionTriggered =
            this._potentialMatchesFlagChangeTriggered =
            this._mergePreviewToggleChangeTriggered =
            this._autoMergeProcessTriggered =
            this._triggerLinkConfirmationDialog =
                false;
    }

    _confirmLinkProcess() {
        if (this._matchProcessType == 'linkandautomerge') {
            if (this.isGoldenDataDirty()) {
                this._autoMergeProcessTriggered = true;
                this._openDiscardChangesConfirmationDialog();
                return;
            }
        }
        this._triggerLinkProcess();
    }

    _openLinkConfitmationDialog() {
        this._triggerLinkConfirmationDialog = true;
        DialogManager.openConfirm(this, 'MatMerLinConMsg', {
            //Show the source entity type
            entityType: this._getExternalEntityType(this.sourceEntity.type)
        });
    }

    _openDiscardChangesConfirmationDialog() {
        let dirtyCheckMessageCode = 'EntMerDirChkMsg';
        if (this._autoMergeProcessTriggered) {
            dirtyCheckMessageCode = 'AutMerDirChkMsg';
        }
        DialogManager.openConfirm(this, dirtyCheckMessageCode);
    }

    confirmDialogHandler(confirmStatus) {
        if (confirmStatus) {
            if (this._triggerReloadSourceEntity) {
                this._triggerReloadSourceEntity = false;
                this._confirmRefreshClick = true;
                this._OnRefreshClick();
                return;
            }
            if (this._triggerLinkConfirmationDialog) {
                this._triggerLinkConfirmationDialog = false;
                this._confirmLinkProcess();
                return;
            }
            this._triggerDiscardChangesProcess();
        } else {
            this._cancelDiscardChangesProcess();
        }
    }

    isGoldenDataDirty() {
        //No dirty check needed for this, as it occurs on 'Move to Next' click
        if (!this.sourceEntity || this.sourceEntity.id != this.sourceEntityId || this._showMessageOnly) {
            return false;
        }

        let attrData = this._getGridDataAndSelectedEntityId(true);

        let foundAttrChangedData = undefined;
        if (this._selectedView == 'tabular') {
            let gridColumns = attrData.gridColumns;
            foundAttrChangedData = gridColumns.filter(
                column =>
                    column.type == 'dataCell' &&
                    column.rsInternalProcessDetails &&
                    ((column.rsInternalProcessDetails.goldenAttribute &&
                        column.rsInternalProcessDetails.goldenAttribute.isValueChanged) ||
                        column.rsInternalProcessDetails.selectedEntityId != attrData.selectedEntityId)
            );
        } else {
            let attrDataRows = attrData.gridData;
            foundAttrChangedData = attrDataRows.filter(
                attr => attr.goldenAttribute.isValueChanged || attr.selectedEntityId != attrData.selectedEntityId
            );
        }

        if (foundAttrChangedData && !ArrayUtils.isEqual(foundAttrChangedData, this._previousApprovedAttributeDetails)) {
            return true;
        }

        let relData = this._getGridDataAndSelectedEntityId();
        let relDataRows = relData.gridData;
        let foundRelChangedData = undefined;
        if (this._selectedView == 'tabular') {
            let gridColumns = relData.gridColumns;
            foundRelChangedData = gridColumns.find(
                column =>
                    column.type == 'dataCell' &&
                    column.rsInternalProcessDetails &&
                    ((column.rsInternalProcessDetails.goldenAttribute &&
                        column.rsInternalProcessDetails.goldenAttribute.isValueChanged) ||
                        column.rsInternalProcessDetails.selectedEntityId != relData.selectedEntityId)
            );
        } else {
            foundRelChangedData = relDataRows.find(
                rel => rel.goldenAttribute.isValueChanged || rel.selectedEntityId != relData.selectedEntityId
            );
        }

        if (foundRelChangedData) {
            return true;
        }

        return false;
    }

    _getGridDataAndSelectedEntityId(isAttribute) {
        let mergeGrid;
        let gridData = [];
        let gridColumns = [];
        let selectedEntityId = '';

        /**
         * When user clicks on any action, system picks the golden data and does the process
         * Graph view golden data is not applicable, and not showing golden data
         * Here further process for any action system needs golden data, so preparing the golden data for graph view
         */
        if (this._selectedView == 'graph') {
            let gridData = isAttribute
                ? ObjectUtils.cloneObject(this._originalComponentData.gridData.attributeGridData)
                : ObjectUtils.cloneObject(this._originalComponentData.gridData.relationshipGridData);
            let config = ObjectUtils.cloneObject(this._originalComponentData.config);
            let columns = isAttribute
                ? config.attributeGridConfig.itemConfig.fields
                : config.relationshipGridConfig.itemConfig.fields;
            let selectedColumn = columns.find(col => col.isRepresentative);

            gridData = gridData.map(data => {
                let valObj = isAttribute
                    ? data.attributeObject[selectedColumn.name]
                    : data.relationshipObject[selectedColumn.name];
                data.goldenAttribute = {
                    name: selectedColumn.name,
                    isValueChanged: false,
                    value: data.hasOwnProperty('previewValue') ? data['previewValue'] : data[selectedColumn.name],
                    valueObject: data.hasOwnProperty('previewObject') ? data['previewObject'] : valObj,
                    originalValueObject: data.hasOwnProperty('previewObject')
                        ? ObjectUtils.cloneObject(data['previewObject'])
                        : ObjectUtils.cloneObject(valObj)
                };
                data.selectedEntityId = selectedColumn.name;
                return data;
            });

            return {
                gridData: gridData,
                selectedEntityId: selectedColumn ? selectedColumn.name : ''
            };
        }
        mergeGrid = this._getMergeGrid(!isAttribute);
        if (mergeGrid) {
            let mergeGridData = mergeGrid.getGridData() || {};
            gridData = mergeGridData.data || [];
            if (this._selectedView == 'tabular') {
                selectedEntityId = mergeGridData.selectedColumn;
                gridColumns = mergeGridData.columns;
            } else if (ObjectUtils.isValidObjectPath(mergeGridData, 'selectedColumn.colDef.columnId')) {
                selectedEntityId =
                    gridData[0] && !ObjectUtils.isEmpty(gridData[0].selectedEntityId)
                        ? gridData[0].selectedEntityId
                        : mergeGridData.selectedColumn.colDef.columnId || '';
            }
        }

        return {
            gridData: gridData,
            gridColumns: gridColumns,
            selectedEntityId: selectedEntityId
        };
    }

    _onContextsChanged(e) {
        let dimensions = {};
        if (e && e.data) {
            dimensions = e.data.dimensions || {};
            this._selectedDimensions = e.data.selectedContextData || {};
        }

        if (ObjectUtils.isEmpty(this._initialContextData)) {
            this._initialContextData = ObjectUtils.cloneObject(this._selectedDimensions);
        }

        if (!ObjectUtils.isEmpty(this._revertDimensions)) {
            if (ObjectUtils.compareObjects(this._revertDimensions, dimensions)) {
                this._revertDimensions = {};
            }
            return;
        }

        this._newDimensions = dimensions;
        this._triggerContextChangeProcess();
    }

    _changeSourceEntity() {
        if (this.isCreateProcess) {
            if (!ObjectUtils.isEmpty(this.processDetails)) {
                //On tab change
                if (
                    this.sourceEntityId == this.processDetails.sourceEntity.id &&
                    this.sourceEntityType &&
                    this.processDetails.sourceEntity.type
                ) {
                    this._onSourceEntityChange();
                    return;
                }
                this.sourceEntityId = this.processDetails.sourceEntity.id;
                this.sourceEntityType = this.processDetails.sourceEntity.type;
                this.sourceEntity = this.processDetails.sourceEntity;
            }
        } else {
            this._getSourceEntity(this.reviewIndex);
        }
    }

    _onBackTap(e) {
        this._reset();
        this._isInitialLoad = true;

        let tabs = this.shadowRoot.querySelector('rock-tabs');
        if (tabs && tabs.reset) {
            tabs.reset();
        }
        this.processDetails = {}; //reset process details
        this.fireBedrockEvent('on-match-merge-back', null);
    }

    _onUpdateTap(e) {
        let reviewPannel = this.mergeReviewPanelEl;

        if (reviewPannel) {
            let recommendationGrid = reviewPannel.shadowRoot.querySelector('#recommendationGrid');

            if (recommendationGrid) {
                let selectedItems = recommendationGrid.getSelectedItems();

                if (selectedItems && selectedItems.length) {
                    let selectedItem = selectedItems[0];
                    this.selectedEntityId = selectedItem.id;
                    this._operation = 'update';
                    let requestData = this._prepareEventRequest();
                    let details = {
                        operation: 'update',
                        processEntity: selectedItem,
                        eventRequestData: requestData
                    };
                    this.fireBedrockEvent('on-match-merge-update', details);
                } else {
                    ToastManager.showWarningToast(this.localize('EntSelTstWar'));
                }
            }
        }
    }

    _getLocalizedText(code, param) {
        if (param == 'entityType' && this.sourceEntity) {
            return this.localize(code, param, this._getExternalEntityType(this.sourceEntity.type));
        }
        return this.localize(code, param);
    }

    _getMergeGrid(isRelationshipGrid = false) {
        let mergeReviewPanel = this.mergeReviewPanelEl;
        let mergeGrid;
        if (mergeReviewPanel) {
            if (isRelationshipGrid) {
                mergeGrid = mergeReviewPanel.shadowRoot.querySelector('#relationshipGrid');
            } else {
                mergeGrid = mergeReviewPanel.shadowRoot.querySelector('#attributeGrid');
            }
        }
        return mergeGrid;
    }

    _onStrategyShowOrHide(e, detail) {
        if (ObjectUtils.isEmpty(detail)) {
            return;
        }

        let mergeGrid = this._getMergeGrid(!detail.isRelationshipGrid);
        if (mergeGrid) {
            let headerCells = mergeGrid.shadowRoot.querySelectorAll('header-cell');
            let headerGoldenCell = [...headerCells].find(
                cell =>
                    ObjectUtils.isValidObjectPath(cell, 'params.column.colDef') &&
                    cell.params.column.colDef.type == 'goldenCell'
            );

            if (headerGoldenCell) {
                headerGoldenCell.resetStrategyColumn(detail.showStrategyColumn);
            }
        }
    }

    _onRowEntitySelection(e, detail) {
        if (ObjectUtils.isEmpty(detail)) {
            return;
        }

        let mergeGrid = this._getMergeGrid(!detail.isRelationshipGrid);
        if (mergeGrid) {
            if (this._selectedView == 'tabular') {
                let tabularCells = mergeGrid.shadowRoot.querySelectorAll('tabular-basic-cell');
                let headerCell = [...tabularCells].find(
                    cell =>
                        cell.column &&
                        cell.data &&
                        cell.column.type == 'selectionCell' &&
                        cell.data.id == detail.columnId
                );
                if (headerCell) {
                    let headerCheckboxEl = headerCell.shadowRoot.querySelector('pebble-checkbox');
                    if (headerCheckboxEl) {
                        headerCheckboxEl.checked = detail.checked;
                    }
                }
            }
        }
        this._updateSelectedMatchedEntities(detail.checked, detail.columnId);
    }

    _updateSelectedMatchedEntities(checked, columnId) {
        if (checked) {
            this._tabularViewSelectedEntities.push(columnId);
        } else {
            const index = this._tabularViewSelectedEntities.indexOf(columnId);
            if (index > -1) {
                this._tabularViewSelectedEntities.splice(index, 1);
            }
        }
        let selectedEntities = this._tabularViewSelectedEntities;
        this._tabularViewSelectedEntities = [];
        this._tabularViewSelectedEntities = selectedEntities;
    }

    _onHeaderSelectionChange(e, detail) {
        if (ObjectUtils.isEmpty(detail)) {
            return;
        }

        let mergeGrid = this._getMergeGrid(!detail.isRelationshipGrid);
        if (mergeGrid) {
            if (this._selectedView == 'tabular') {
                let tabularCells = mergeGrid.shadowRoot.querySelectorAll('tabular-basic-cell');
                let headerCell = [...tabularCells].find(
                    cell =>
                        cell.column && cell.data && cell.column.type == 'headerCell' && cell.data.id == detail.columnId
                );
                if (headerCell) {
                    let headerCheckboxEl = headerCell.shadowRoot.querySelector('pebble-checkbox');
                    if (headerCheckboxEl) {
                        headerCheckboxEl.checked = detail.checked;
                        headerCell.triggerCheckboxChange(detail.checked, detail.columnId);
                    }
                }
            } else {
                let columns = mergeGrid.shadowRoot.querySelectorAll('header-cell');
                let selectedColumn;
                for (let col of columns) {
                    if (
                        ObjectUtils.isValidObjectPath(col, 'params.column.colDef.columnId') &&
                        col.params.column.colDef.columnId == detail.selectedEntityId
                    ) {
                        selectedColumn = col;
                        col.params.column.colDef.manualChecked = true;
                        break;
                    }
                }
                if (selectedColumn) {
                    let selectedCheckbox = selectedColumn.shadowRoot.querySelector('pebble-checkbox');
                    if (selectedCheckbox) {
                        selectedCheckbox.checked = true;
                        selectedColumn.triggerInputCheckChange(true);
                    }
                }
            }
        }
    }

    _onMarkAsRepesentative(e) {
        let { entityId, entityType } = this._fetchEntityDetailFromEvent(e);
        this._isContextChanged = false; //Reset

        if (entityId && entityType) {
            this._loading = true;

            if (this.isCompareProcess) {
                this._isInitialLoad = true;
                this._sourceEntitiesIdTypeMappings = [
                    {
                        id: entityId,
                        type: entityType
                    }
                ];
                this._getSourceEntity(this.reviewIndex);
                return;
            }

            this.entities.forEach(v => {
                if (v.id == entityId) {
                    v.isRep = true;
                } else {
                    v.isRep = false;
                }
            });

            this._clearFilters();
            this._markAsRepTriggered = true;
            setTimeout(() => {
                this._setEntitiesToGrid(this.entities, true);
            }, 50);
        }
    }

    _hideDataFilter(showMessageOnly, hideDataFilter) {
        return showMessageOnly || hideDataFilter;
    }

    _getAccordionClass(showMessage) {
        if (showMessage) {
            return 'accordion-message';
        }
        return '';
    }

    _getDiscardActionText(isCreateProcess) {
        if (isCreateProcess) {
            return this.localize('DisBtn');
        }
        return this.localize('DltTxt');
    }

    _fetchEntityDetailFromEvent(e) {
        if (e && e.detail && e.detail.data) {
            let detailData = e.detail.data;

            return {
                entityId: detailData.columnId,
                entityType: detailData.columnType
            };
        } else if (e.data) {
            return {
                entityId: e.data.id,
                entityType: e.data.type
            };
        }
    }

    _computeOriginalAssetAttribute() {
        let damSettings = SettingsManager.appSetting('dataDefaults').damSettings || {};
        if (!ObjectUtils.isEmpty(damSettings)) {
            return damSettings.originalAssetAttribute;
        }
        return 'property_objectkey';
    }

    _computePreviewAssetAttribute() {
        const hasThumbnail = ObjectUtils.isValidObjectPath(this.recommendationGridConfig, 'itemConfig.thumbnailId');
        const previewAssetAttribute = hasThumbnail ? this.recommendationGridConfig.itemConfig.thumbnailId : '';
        /** 1. Return recommendationGridConfig's thumbnail Id if it exists */
        if (previewAssetAttribute) {
            return previewAssetAttribute;
        }
        /** 2. Else look in damSettings */
        const damSettings = SettingsManager.appSetting('dataDefaults').damSettings || {};
        if (!ObjectUtils.isEmpty(damSettings)) {
            return damSettings.previewAssetAttribute;
        }
        /** 3. fallback */
        return 'thumbnailid';
    }

    _getColumnValue(params) {
        let gridData = params.data;
        let columnName = params.column && params.column.colDef ? params.column.colDef.field : undefined;

        let cellData = '';
        let previewAssetUrl = '';
        if (gridData && columnName) {
            previewAssetUrl = gridData[columnName] ? gridData.previewAssetUrl : '';
            if (previewAssetUrl) {
                return previewAssetUrl;
            }
            let thumbnailAttribute = gridData.attributes[columnName];
            if (thumbnailAttribute && thumbnailAttribute.value) {
                cellData = thumbnailAttribute.value;
            } else if (gridData.properties) {
                cellData = gridData.properties[columnName];
            }
            if (cellData) {
                previewAssetUrl = gridData.properties.previewAssetUrl;
            }
        }
        return previewAssetUrl;
    }

    _getAssetDetails(params) {
        const item = params ? params.data : null;
        let assetDetails = {};
        if (item) {
            const digitalAssetTypes = SettingsManager.appSetting('dataDefaults').entityTypes.digitalAsset;
            if (item.type && !ObjectUtils.isEmpty(digitalAssetTypes) && digitalAssetTypes.indexOf(item.type) > -1) {
                return item;
            }
            const imagePreviewObj = EntityUtils.getEntityImageObject(
                item,
                this._previewAssetAttribute,
                this.contextData
            );
            const imageOriginalObj = EntityUtils.getEntityImageObject(
                item,
                this._originalAssetAttribute,
                this.contextData
            );
            assetDetails = {
                [this._previewAssetAttribute]: imagePreviewObj.value,
                [this._originalAssetAttribute]: imageOriginalObj.value,
                type: 'image'
            };
        }
        return assetDetails;
    }

    _showMatchMergeMessage(matchMergeMessage) {
        return !ObjectUtils.isEmpty(matchMergeMessage);
    }

    async _updateMissingAttributeModels() {
        if (!ObjectUtils.isEmpty(this.recommendationGridConfig)) {
            let itemConfig = this.recommendationGridConfig.itemConfig;
            let fields = itemConfig ? itemConfig.fields : undefined;

            let attributeNames = this._getAttributesFromConfig(fields);
            let missingAttributeNames = [];
            let missingAttributes = [];

            if (!ObjectUtils.isEmpty(this._attributeModels)) {
                let exisintgAttributeNames = Object.keys(this._attributeModels);
                attributeNames.forEach(v => {
                    if (exisintgAttributeNames.indexOf(v) < 0) {
                        missingAttributeNames.push(v);
                    }
                });
            } else {
                missingAttributeNames = attributeNames;
            }

            if (!ObjectUtils.isEmpty(missingAttributeNames)) {
                let requestData = DataRequestHelper.createGetAttributeModelRequest(missingAttributeNames);
                let dalReqOptions = {};
                dalReqOptions.dataIndex = 'entityModel';
                requestData['domain'] = this.domain;
                let attributeModelsGetRequest = DataObjectManager.createRequest(
                    'getbyids',
                    requestData,
                    '',
                    dalReqOptions
                );

                let attributeModelsGetResponse = await DataObjectManager.initiateRequest(attributeModelsGetRequest);
                if (
                    attributeModelsGetResponse &&
                    attributeModelsGetResponse.response &&
                    attributeModelsGetResponse.response.status == 'success'
                ) {
                    let responseContent = DataHelper.validateAndGetResponseContent(attributeModelsGetResponse.response);
                    if (responseContent) {
                        let entityModels = responseContent.entityModels;
                        let attrModelObj = {};
                        entityModels.forEach(elem => {
                            attrModelObj[elem.name] = elem;
                        });
                        let attributeDataModels = { data: { attributes: attrModelObj } };
                        missingAttributes = DataTransformHelper.transformAttributeModels(
                            attributeDataModels,
                            {},
                            false
                        );
                    }
                }

                if (!ObjectUtils.isEmpty(missingAttributes)) {
                    for (let missingAttr in missingAttributes) {
                        this._attributeModels[missingAttr] = missingAttributes[missingAttr];
                    }
                }
            }
        }
    }

    _getAttributesFromConfig(fields) {
        let attributes = [];
        for (let fieldKey in fields) {
            let field = fields[fieldKey];
            if (field && field.name) {
                attributes.push(field.name);
            }
        }
        return attributes;
    }

    _showColumnarViewTap() {
        if ((this._tabularViewSelectedEntities || []).length > this.matchEntitiesLimit) {
            ToastManager.showWarningToast(
                this.localize('EntMerLmtVldMsg', {
                    matchEntitiesLimit: this.matchEntitiesLimit
                })
            );
            return;
        }
        this._selectTab('columnar');
    }

    _triggerShowTabularView() {
        this._selectTab('tabular');
    }

    _selectTab(tabName = 'columnar') {
        if (this._selectedView != tabName) {
            let tabsEl = this.shadowRoot.querySelector('rock-tabs');
            if (tabsEl && tabsEl.config && tabsEl.config.tabItems) {
                let tabularTabConfig = tabsEl.config.tabItems.find(item => item.name == tabName);
                if (tabularTabConfig) {
                    tabsEl.selectTabIndex(tabularTabConfig.index);
                }
            } else {
                this._selectedView = tabName;
                this._ignoreDefaultViewSelection = true;
                this._modelList = [];
                this._changeSourceEntity();
            }
        }
    }

    _onTabsChange(detail) {
        let selectedView = 'columnar';
        if (detail && detail.data) {
            selectedView = detail.data.activeTab;
        }

        if (selectedView == 'tabular') {
            this._tabularViewSelectedEntities = [];
        }

        this._selectedView = selectedView;
        if (!this._isInitialLoad) {
            this._modelList = [];
            this._isTabChangeProcess = true;
            this._changeSourceEntity();
        } else {
            this._isInitialLoad = false;
        }
    }

    _onTabComponentCreated(e, detail) {
        const tabComponentNames = [
            'rock-merge-review-panel',
            'rock-match-merge-graph-view',
            'rock-match-merge-chart-view'
        ];
        if (detail && detail.data && tabComponentNames.includes(detail.data.name) && this._reloadTabComponent) {
            this._reloadCurrentComponent();
            this._reloadTabComponent = false;
            setTimeout(() => {
                this._triggerHideShowContainer();
            });
        }
    }

    _isRecommendationView(viewMode) {
        if (viewMode == 'recommendation') {
            return true;
        }
        return false;
    }

    _hideContextSelector() {
        return this._showMessageOnly || this.isCreateProcess;
    }

    _onColumnLinkClick(e, detail) {
        if (detail && detail.data) {
            let entityId = detail.data.columnId;
            NavigationManager.setNavigationData(
                'rock-context-selector',
                this._selectedDimensions,
                null,
                'entity-manage',
                entityId
            );
        }
    }

    /**
     * This is only for match/create flow, Create/Update buttons should display instead of Approve
     */
    _disableApproveActions(action, entities, sourceEntity) {
        if (ObjectUtils.isEmpty(entities) || ObjectUtils.isEmpty(sourceEntity)) return;
        let defaultSelectedEntity = this._getDefaultSelectedEntity(entities);
        let disable = false;
        if (defaultSelectedEntity) {
            if (action == 'create') {
                disable = defaultSelectedEntity.id != sourceEntity.id;
            } else if (action == 'update') {
                disable = defaultSelectedEntity.id == sourceEntity.id;
            }
        }
        return disable;
    }

    async _onAllowMergePreviewChange(event) {
        this._toggleEvent = event;
        if (this.isGoldenDataDirty()) {
            this._mergePreviewToggleChangeTriggered = true;
            this._openDiscardChangesConfirmationDialog();
            return;
        }
        await this._triggerMergePreviewToggleChange();
    }

    async _triggerMergePreviewToggleChange() {
        if (this.allowMergePreview != this._toggleEvent.detail.allowMergePreview) {
            this._isPreviewChanged = true;
            this.allowMergePreview = this._toggleEvent.detail.allowMergePreview;
            await this._onSourceEntityChange();
        }
        //Reset
        this._mergePreviewToggleChangeTriggered = false;
        this._toggleEvent = {};
    }

    _onSelectPotentialMatchesFlagChange(event) {
        this._potentialMatchesFlagChangeEvent = event.target.checked;
        this._potentialMatchesFlagChangeTriggered = true;
        if (this.isGoldenDataDirty()) {
            this._openDiscardChangesConfirmationDialog();
            return;
        }
        this._triggerPotentialMatchesFlagChange();
    }

    _triggerPotentialMatchesFlagChange() {
        this.selectPotentialMatches = this._potentialMatchesFlagChangeEvent;
        this._isPreviewChanged = true;
        this._sourceEntityDataProcess(this._sourceEntityGetResponse, this._sourceEntityWhereusedGetResponse);
    }

    _isLinkAllowed() {
        if (this._isWhereusedProcess) {
            return false;
        }
        if (!ObjectUtils.isEmpty(this._isSourceOfRelationship) && !ObjectUtils.isEmpty(this.entities)) {
            let defaultSelectedEntity = this._getDefaultSelectedEntity(this.entities);
            let isSourceRelEntityId =
                this._isSourceOfRelationship && this._isSourceOfRelationship.relTo
                    ? this._isSourceOfRelationship.relTo.id
                    : '';
            if (defaultSelectedEntity && isSourceRelEntityId && defaultSelectedEntity.id == isSourceRelEntityId) {
                return false; //No need to link, its already linked
            }
        }
        return true;
    }

    _getTypeIconNameById(type) {
        if (!ObjectUtils.isEmpty(this._typeIconMapper[type])) {
            return this._typeIconMapper[type];
        }
        this._typeIconMapper[type] = EntityTypeManager.getTypeIconNameById(type);
        return this._typeIconMapper[type];
    }

    _isSourceSelectedAsRepresentative() {
        return this._isOwnedProcess && this.sourceEntity && this.sourceEntity.isRep;
    }

    _hideAction(actionName) {
        if (
            ObjectUtils.isEmpty(this.mergeReviewActionAccess) ||
            !this.mergeReviewActionAccess.hasOwnProperty(actionName)
        ) {
            return false;
        }

        let hideAction = false;
        switch (actionName) {
            case 'create':
                hideAction = this._hideSourceCreate || !this.mergeReviewActionAccess[actionName];
                break;
            case 'discard':
            case 'link':
                hideAction = !this.mergeReviewActionAccess[actionName];
                break;
            case 'manualmerge':
            case 'linkandmanualmerge':
                hideAction =
                    !this.mergeReviewActionAccess[actionName] || (!this.allowMergePreview && this._isInitialDataLoad);
                break;
            case 'automerge':
                hideAction =
                    this.isCompareProcess ||
                    !this.mergeReviewActionAccess[actionName] ||
                    !this.allowMergePreview ||
                    this._isWhereusedProcess;
                break;
            case 'linkandautomerge':
                hideAction =
                    !this.mergeReviewActionAccess[actionName] || !this.allowMergePreview || this._isWhereusedProcess;
                break;
        }

        return hideAction;
    }

    showSummaryList(event) {
        let popoverSummaryList = this.shadowRoot.querySelector('#popover-summary-list');
        if (popoverSummaryList) {
            popoverSummaryList.positionTarget = event.target;
            popoverSummaryList.show(true);
        }
    }

    _disablePotentialMatch(loading, isSourceOfRel) {
        return loading || ObjectUtils.isEmpty(isSourceOfRel);
    }

    _reviewStatusCount(reviewEntities, reviewIndex) {
        return `${reviewIndex + 1} / ${reviewEntities.length}`;
    }

    _onReviewMatches() {
        this._ignoreShowNewStateMessage = true;
        this._sourceEntityDataProcess(this._sourceEntityGetResponse, this._sourceEntityWhereusedGetResponse);
    }

    _showPotentialMatchCheckbox() {
        return (
            this.showPotentialMatch &&
            this.showActionButtons &&
            (!this._showMessageOnly || (this._showMessageOnly && this._ownedRelationshipLimitExceeded))
        );
    }

    _getClassForMessageOnly() {
        return this._showMessageOnly ? 'message-only' : '';
    }

    _hideSeperator() {
        return this._showMessageOnly || !this.showActionButtons;
    }

    _showNextContainer() {
        return this.isBulkProcess && !this.isCompareProcess;
    }

    _getSaveActionText() {
        if (this.isCompareProcess) {
            return this.localize('SavTxt');
        }
        return this.localize('ManMerTxt');
    }

    _getModelExternalAttributes() {
        let modelExternalAttributes = {};
        if (!ObjectUtils.isEmpty(this._modelList)) {
            for (let model of this._modelList) {
                if (model && model.data && model.data.attributes) {
                    let isEntityIdentifierAttribute = '';
                    let isExternalNameAttribute = '';
                    for (let attrName in model.data.attributes) {
                        if (isEntityIdentifierAttribute && isExternalNameAttribute) {
                            break;
                        }
                        let attribute = model.data.attributes[attrName];
                        if (attribute.properties && attribute.properties.isEntityIdentifier) {
                            isEntityIdentifierAttribute = attrName;
                        } else if (attribute.properties && attribute.properties.isExternalName) {
                            isExternalNameAttribute = attrName;
                        }
                    }
                    modelExternalAttributes[model.name] = {
                        isEntityIdentifierAttribute: isEntityIdentifierAttribute,
                        isExternalNameAttribute: isExternalNameAttribute
                    };
                }
            }
        }
        return modelExternalAttributes;
    }

    _getRelatedEntityAttributes() {
        let previewAssetAttribute = this._computePreviewAssetAttribute();
        let originalAssetAttribute = this._computeOriginalAssetAttribute();
        let relatedEntityAttributes = [previewAssetAttribute, originalAssetAttribute];
        for (let modelType in this._modelExternalAttributes) {
            if (this._modelExternalAttributes[modelType].isEntityIdentifierAttribute) {
                relatedEntityAttributes.push(this._modelExternalAttributes[modelType].isEntityIdentifierAttribute);
            }
            if (this._modelExternalAttributes[modelType].isExternalNameAttribute) {
                relatedEntityAttributes.push(this._modelExternalAttributes[modelType].isExternalNameAttribute);
            }
        }
        return _.uniq(relatedEntityAttributes);
    }

    _showActionButtons() {
        if (this._selectedView === 'chart') {
            return false;
        }

        return this._selectedView === 'tabular'
            ? this.tabularViewMode !== 'readonly'
            : (this.showActionButtons && !this.isCompareProcess) ||
                  (this.showActionButtons && this.isCompareProcess && !this.isCompareReadonly);
    }

    async _onGoldenDataChange() {
        await this._getEntityWithGoldenData(true);
        if (this._isAnyChangeInGoldenData) {
            this._isInitialDataLoad = false;
        } else {
            this._isInitialDataLoad = true;
        }
    }

    _onLoadingChange() {
        let action = this.aci.createAction({
            name: 'merge-review-loading',
            detail: {
                isLoading: this._loading || this._mergeGridDataLoading
            }
        });
        if (this.aci.dispatch) {
            this.aci.dispatch(action);
        }
    }

    _showMatchInfoDialog() {
        if (ObjectUtils.isEmpty(this._mlBasedResults)) {
            return;
        }

        let gridHeaders = [];
        if (ObjectUtils.isValidObjectPath(this._config, 'attributeGridConfig.itemConfig.fields')) {
            let headerFields = this._config.attributeGridConfig.itemConfig.fields;
            let entityIds = ObjectUtils.cloneObject(this.matchedEntityIds) || [];
            entityIds.push(this.sourceEntityId);
            gridHeaders = headerFields.filter(field => entityIds.includes(field.name));
        }

        if (ObjectUtils.isEmpty(gridHeaders)) {
            return;
        }

        let sourceEntityHeader = gridHeaders.find(header => header.name == this.sourceEntityId);
        let gridColumns = [
            {
                headerName: this.localize('AttTxt'),
                field: 'attribute',
                headerTooltip: this.localize('AttTxt'),
                tooltipField: 'attribute',
                resizable: true,
                displaySequence: 0
            }
        ];
        this.matchedEntityIds.forEach((entityId, index) => {
            let entityHeader = gridHeaders.find(header => header.name == entityId);
            if (!entityHeader) {
                return;
            }
            gridColumns.push({
                headerName: entityHeader.header,
                field: entityHeader.name,
                headerTooltip: entityHeader.header,
                tooltipField: entityHeader.name,
                resizable: true,
                displaySequence: index + 10
            });
        });

        let gridData = [];
        if (!ObjectUtils.isEmpty(this._mlBasedResults.fullList)) {
            let attributes = [];
            let matchAttributes = {};
            for (let item of this._mlBasedResults.fullList) {
                if (item.formattedAttributes) {
                    attributes = attributes.concat(Object.keys(item.formattedAttributes));
                    if (this.matchedEntityIds.includes(item.id)) {
                        matchAttributes[item.id] = item.formattedAttributes || {};
                    }
                }
            }
            attributes = _.uniq(attributes);

            if (!ObjectUtils.isEmpty(attributes)) {
                attributes.forEach(attribute => {
                    if (attribute == 'identifier') {
                        return;
                    }
                    let data = {};
                    gridColumns.forEach(column => {
                        if (column.field == 'attribute') {
                            data[column.field] =
                                this._familyNames[attribute] || attribute.charAt(0).toUpperCase() + attribute.slice(1);
                        } else {
                            if (matchAttributes[column.field]) {
                                let value = matchAttributes[column.field][attribute] || '';
                                if (value) {
                                    if (attribute == 'score' || !isNaN(value)) {
                                        value = parseFloat(value).toFixed(2);
                                    } else if (typeof value == 'string') {
                                        value = value.charAt(0).toUpperCase() + value.slice(1);
                                    }
                                }
                                data[column.field] = value;
                            }
                        }
                    });
                    gridData.push(data);
                });
            }
        }

        let matchInfoDialog = this.shadowRoot.querySelector('#matchInfoDialog');
        if (matchInfoDialog) {
            matchInfoDialog.dialogTitle = `${this.localize('MatDetTxt')} : ${sourceEntityHeader.header}`;
            this._matchInfoGridColumns = gridColumns;
            this._matchInfoGridItems = gridData;
            matchInfoDialog.open();
        }
    }

    _getMessageClass() {
        if (this._matchMergeInformation) {
            return this.isCompareProcess ? 'compare-label' : 'compare-label no-match-msg';
        }
    }

    _isTabularView() {
        return this._selectedView === 'tabular';
    }

    _disableTabularViewAction() {
        return (
            ObjectUtils.isEmpty(this._tabularViewSelectedEntities) ||
            this._tabularViewSelectedEntities.length > this.matchEntitiesLimit
        );
    }

    _showTabularViewLink() {
        return this.allowTabularView && this._isMaxLimitExceedMessage;
    }

    _OnRefreshClick() {
        this._clearNotificationBlinker();

        if (this.isGoldenDataDirty() && !this._confirmRefreshClick) {
            this._triggerReloadSourceEntity = true;
            this._openDiscardChangesConfirmationDialog();
        } else {
            this._getSourceEntity(this.reviewIndex);
        }
        this._confirmRefreshClick = false;
    }

    /**
     *  Start notification timer
     */
    _startNotificationTimer() {
        this._loading = true;
        this.notificationTimer = setTimeout(() => {
            //If the notifications are not received within 10s, show toast
            if (this._notificationAwaitTracker.length > 0) {
                ToastManager.showWarningToast(this.localize('OpeWaiRefMsg'));
            }
            clearTimeout(this.notificationTimer);
            this._loading = false;
        }, this.processCompleteTimer);
    }

    /**
     *   Reload Source Entity if page is not dirty
     */
    _reloadSourceEntity() {
        //Stop the notification timer
        clearTimeout(this.notificationTimer);
        this._loading = false;
        //If page is not dirty , refresh the page to show latest updates only if auto refresh flag is configured
        if (this.autoRefreshOnProcessCompleteNotification && !this.isGoldenDataDirty()) {
            this._confirmRefreshClick = true;
            this._OnRefreshClick();
        } else {
            //Highlight the blinker
            this._showNotificationBlinker();
        }
    }

    /**
     *   Function to show the blinker
     */
    _showNotificationBlinker() {
        let refreshButton = this.shadowRoot.querySelector('#matchReviewRefreshBtn');
        if (refreshButton) {
            this._refreshBtnTitle = this.localize('RfsBtnTit');

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
        let refreshButton = this.shadowRoot.querySelector('#matchReviewRefreshBtn');
        if (refreshButton) {
            this._refreshBtnTitle = this.localize('RfsTxt');
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
}
customElements.define('rock-match-merge', RockMatchMerge);
