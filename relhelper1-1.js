import { DataObjectManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/DataObjectManager.js';
import { DALCommonUtils } from '@riversandtechnologies/ui-platform-dataaccess/lib/utils/DALCommonUtils.js';
import DataRequestHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/DataRequestHelper.js';
import { ObjectUtils } from '@riversandtechnologies/ui-platform-utils/lib/common/ObjectUtils.js';
import { LoggerManager } from '@riversandtechnologies/ui-platform-elements/lib/managers/logger-manager.js';
import { UniqueIdUtils } from '@riversandtechnologies/ui-platform-utils/lib/common/UniqueIdUtils.js';
import DataHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/DataHelper.js';
import { AttributeUtils } from '@riversandtechnologies/ui-platform-utils/lib/mdm/AttributeUtils';
import { ContextUtils } from '@riversandtechnologies/ui-platform-utils/lib/mdm/ContextUtils';
import { EntityCompositeModelManager } from '@riversandtechnologies/ui-platform-dataaccess/lib/managers/EntityCompositeModelManager.js';
import DataTransformHelper from '@riversandtechnologies/ui-platform-business-elements/lib/helpers/DataTransformHelper.js';
class RelMappingHelper {
    static mappingRequestType = 'mappingrequest';
    static mappingRequestExternalName = 'Mapping Request';
    static mappingRequestStatus = 'Pending';
    static config = {};

    /**
     * Function to populate the config. This config is used to get the configured batch/pagesize.
     */
    static setConfig(config) {
        this.config = config;
    }

    /**
     * Function to create a mapping request entity
     */
    static createMappingRequestDataRequest({
        targetId,
        sourceId,
        targetPath,
        sourcePath,
        linkStatus, //Link or Unlink
        targetExternalName,
        sourceExternalName,
        targetEntityType,
        sourceEntityType,
        relationship,
        user,
        mappedContext,
        sourceEntityTypeExternalName,
        targetEntityTypeExternalName
    }) {
        const defaultLocale = DALCommonUtils.getDefaultLocale();
        const entityId = UniqueIdUtils.generateUUID();
        const request = {
            id: entityId,
            type: this.mappingRequestType,
            data: {
                attributes: {
                    rsInternalTarget: {
                        values: [
                            {
                                id: '1_0_0',
                                value: targetId,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalSource: {
                        values: [
                            {
                                id: '1_0_0',
                                value: sourceId,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalRelationship: {
                        values: [
                            {
                                id: '1_0_0',
                                value: relationship,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalSourceExternalName: {
                        values: [
                            {
                                id: '1_0_0',
                                value: sourceExternalName,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalSourcePath: {
                        values: [
                            {
                                id: '1_0_0',
                                value: sourcePath,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalTargetPath: {
                        values: [
                            {
                                id: '1_0_0',
                                value: targetPath,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalTargetExternalName: {
                        values: [
                            {
                                id: '1_0_0',
                                value: targetExternalName,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalUser: {
                        values: [
                            {
                                id: '1_0_0',
                                value: user,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalStatus: {
                        values: [
                            {
                                id: '1_0_0',
                                value: this.mappingRequestStatus,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalRequestType: {
                        values: [
                            {
                                id: '35_0_0',
                                value: linkStatus,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalSourceEntityType: {
                        values: [
                            {
                                id: '35_0_0',
                                value: sourceEntityType,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalTargetEntityType: {
                        values: [
                            {
                                id: '35_0_0',
                                value: targetEntityType,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalSourceEntityTypeExternalName: {
                        values: [
                            {
                                id: '35_0_0',
                                value: sourceEntityTypeExternalName,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalTargetEntityTypeExternalName: {
                        values: [
                            {
                                id: '35_0_0',
                                value: targetEntityTypeExternalName,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalSourceType: {
                        values: [
                            {
                                id: '35_0_0',
                                value: sourcePath?.split('>>')[0],
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalTargetType: {
                        values: [
                            {
                                id: '35_0_0',
                                value: targetPath?.split('>>')[0],
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    },
                    rsInternalContextInfo: {
                        values: [
                            {
                                id: '35_0_0',
                                value: mappedContext,
                                locale: defaultLocale,
                                source: 'internal'
                            }
                        ]
                    }
                }
            }
        };

        return request;
    }

    /**
     * Function to create context object in the format required for the request.
     */
    static createContextObj(selectedContext) {
        if (!ObjectUtils.isEmpty(selectedContext)) {
            const ctxType = Object.keys(selectedContext)[0];
            const selectedCtxObj = ctxType !== 'global' ? { [ctxType]: selectedContext[ctxType][0].id } : {};
            return selectedCtxObj;
        }
        return {};
    }

    /**
     * Function to get a config with given name
     */
    static async getConfig(name, type) {
        let configRequest = DataRequestHelper.createConfigInitialRequest({});
        if (ObjectUtils.isValidObjectPath(configRequest, 'params.query')) {
            delete configRequest.params.query.contexts;
            configRequest.params.query.name = name;
            if (!configRequest.params.query.filters) {
                configRequest.params.query.filters = {};
            }
            configRequest.params.query.filters.typesCriterion = [type];
        }
        let url = '/data/pass-through/configurationservice/get';
        let configResponse = await DataObjectManager.rest(url, configRequest);
        return configResponse;
    }

    /**
     * Function to get a match config attributes
     */
    static async getMatchConfigAttributes(entitytype) {
        let matchConfigResponse = await this.getConfig(entitytype, 'matchConfig');
        let deterministicMatchAttributes = [];
        if (matchConfigResponse && matchConfigResponse.response.status == 'success') {
            let res = matchConfigResponse.response;
            if (ObjectUtils.isValidObjectPath(res, 'configObjects.0.data.jsonData.matchRules')) {
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
        return deterministicMatchAttributes;
    }

    /**
     * Function to get an entity with match config attributes
     */
    static async getEntity(id, type, context) {
        let attributes = await this.getMatchConfigAttributes(type);
        let request = {
            params: {
                query: {
                    id: id,
                    filters: {
                        typesCriterion: [type]
                    }
                },
                fields: {
                    attributes: attributes,
                    relationships: ['_ALL']
                }
            }
        };
        if (!ObjectUtils.isEmpty(context)) {
            const contextType = Object.keys(context)[0];
            if (context[contextType].toLowerCase() !== 'global') {
                request.params.query[ContextUtils.CONTEXT_TYPE_DATA] = [context];
            }
        }
        let entityGetResponse = await DataObjectManager.rest('/data/pass-through/entityappservice/get', request);
        if (entityGetResponse.response.status == 'success' && entityGetResponse.response.totalRecords > 0) {
            return entityGetResponse.response.entities[0];
        }
    }

    static async getRelationships(sourceType, targetType, sourceDomain, targetDomain, clonedContextData, ownership) {
        let itemContext = {};
        itemContext.type = targetType?.id;
        itemContext.relationships = ['_ALL'];
        itemContext.relationshipAttributes = ['_ALL'];
        clonedContextData[ContextUtils.CONTEXT_TYPE_ITEM] = [itemContext];
        let rels = [];
        if (targetDomain) {
            clonedContextData[ContextUtils.CONTEXT_TYPE_DOMAIN] = [{ domain: targetDomain.id }];
        }

        let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);
        if (ObjectUtils.isValidObjectPath(compositeModelGetRequest, 'params.query')) {
            delete compositeModelGetRequest.params.query.name;
            compositeModelGetRequest.params.query.id = targetType?.id + '_entityCompositeModel';
        }

        const compositeModel = await EntityCompositeModelManager.getCompositeModel(
            compositeModelGetRequest,
            clonedContextData
        );
        if (compositeModel && compositeModel.data) {
            const relationshipModels = DataTransformHelper.transformRelationshipModels(
                compositeModel,
                clonedContextData
            );

            // let defaultRelationshipObj = {};
            const currentItem = relationshipModels;
            if (currentItem) {
                const relTypes = Object.keys(currentItem);

                for (const relType of relTypes) {
                    const rel = currentItem[relType];

                    for (const relItem of rel) {
                        const properties = relItem.properties;
                        const relEntityTypes = properties.relatedEntityInfo.map(
                            relEntityInfo => relEntityInfo.relEntityType
                        );
                        let isSourceEntityTypeInRelEntityTypes = false;

                        if (sourceDomain.hasClassifications) {
                            isSourceEntityTypeInRelEntityTypes = relEntityTypes.includes(sourceDomain.manageModelName);
                        } else {
                            isSourceEntityTypeInRelEntityTypes = relEntityTypes.includes(sourceType.id);
                        }

                        if (
                            relItem.id &&
                            properties?.relationshipOwnership === ownership &&
                            isSourceEntityTypeInRelEntityTypes
                        ) {
                            const externalName = relItem.properties.externalName || relItem.id;

                            const newItem = {
                                id: relItem.id,
                                relationshipName: relType,
                                title: externalName,
                                value: externalName,
                                relEntityTypes: properties.relatedEntityInfo.map(
                                    relEntityInfo => relEntityInfo.relEntityType
                                ),
                                attributes: relItem.attributes,
                                ownership: relItem?.properties?.relationshipOwnership
                            };

                            rels.push(newItem);
                        }
                    }
                }
            }
            return rels;
        } else {
            LoggerManager.info('relationships not found');
            return [];
        }
    }

    /**
     * Function to get the entites which have a belongs to relationship
     * (Getting the entites which have not been listed on the grid due to the limit)
     */
    static async getBelongsToEntityIds(typeFilters) {
        let request = {
            params: {
                query: {
                    filters: typeFilters,
                    valueContexts: [
                        {
                            source: 'internal',
                            locale: 'en-US'
                        }
                    ]
                },
                fields: {
                    relationships: ['belongsto']
                }
            }
        };
        let entityGetResponse = await DataObjectManager.rest('/data/pass-through/entityappservice/get', request);
        if (entityGetResponse?.response?.status == 'success' && entityGetResponse?.response?.totalRecords > 0) {
            const entities = entityGetResponse.response.entities;
            let ids = new Set();
            entities?.forEach(obj => ids.add(obj.id));
            return ids;
        }
    }

    /**
     * Function to create relationship with given relationship name
     */
    static async createRelMappingSaveRequest(
        targetId,
        sourceId,
        relationship,
        targetType,
        sourceType,
        saveEntities,
        linkStatus,
        mappedContext
    ) {
        //First get entity object with its matching attributes
        let request = await this.getEntity(targetId, targetType, mappedContext);
        //Check if the entity already exists in the saveEntities array, If yes append the relationship to the existing entity request
        if (!ObjectUtils.isEmpty(saveEntities)) {
            let entityId = request.id;
            let existingRequest = _.find(saveEntities, function (item) {
                return item.id == entityId;
            });
            if (!ObjectUtils.isEmpty(existingRequest)) {
                request = existingRequest;
            }
        }

        if (
            linkStatus.toLowerCase() == 'unlink' &&
            (ObjectUtils.isValidObjectPath(request, 'data.relationships.' + relationship) ||
                ObjectUtils.isValidObjectPath(request, 'data.contexts.0.relationships.' + relationship))
        ) {
            //Delete existing ismappedto relationship
            let isMappedRels = ObjectUtils.isEmpty(mappedContext)
                ? request?.data?.relationships[relationship]
                : request?.data?.contexts[0]?.relationships[relationship];

            let mappedRelObj = _.find(isMappedRels, function (item) {
                if (item.relTo.id == sourceId) {
                    return item;
                }
            });
            if (mappedRelObj) mappedRelObj.action = 'delete';
        } else {
            //Creating ismappedto relationship
            let relId = UniqueIdUtils.generateUUID();
            let relObj = {
                id: relId,
                relTo: {
                    id: sourceId,
                    type: sourceType
                }
            };
            let relObjToSave = {
                [relationship]: [relObj]
            };

            // if context is global
            if (ObjectUtils.isEmpty(mappedContext)) {
                if (request?.data?.relationships) {
                    //If relationship already exists then push to current array
                    if (ObjectUtils.isValidObjectPath(request, 'data.relationships.' + relationship)) {
                        request.data.relationships[relationship].push(relObj);
                    } else {
                        //else create new relationship object
                        request.data.relationships[relationship] = [relObj];
                    }
                } else {
                    //if relationship never existed then set new relationships object it self
                    if (!request.data) {
                        request.data = {};
                    }
                    request.data['relationships'] = relObjToSave;
                }
            } else {
                if (request?.data?.contexts && request?.data?.contexts[0]?.relationships) {
                    //If relationship already exists then push to current array
                    if (ObjectUtils.isValidObjectPath(request, 'data.contexts.0.relationships.' + relationship)) {
                        request.data.contexts[0].relationships[relationship].push(relObj);
                    } else {
                        //else create new relationship object
                        request.data.contexts[0].relationships[relationship] = [relObj];
                    }
                } else {
                    //if relationship never existed then set new relationships object it self
                    if (!request.data) {
                        request.data = {};
                    }
                    if (!request.data.contexts) {
                        request.data.contexts = [];
                    }
                    request.data.contexts[0]['relationships'] = relObjToSave;
                }
            }
        }

        return request;
    }

    /**
     * Function to get the governed flag
     */
    static async getGovernFlag() {
        let appConfigResponse = await this.getConfig('relmappings_appconfig', 'appConfig');
        if (appConfigResponse && appConfigResponse?.response?.status == 'success') {
            let res = appConfigResponse.response;
            if (ObjectUtils.isValidObjectPath(res, 'configObjects.0.data.jsonData.settings')) {
                return res.configObjects[0].data.jsonData.settings.isGoverned;
            }
        }
        return false;
    }

    /**
     * Function to build the filterData to get state
     */
    static getFilterData(sourceType, targetType, sourceDomain, targetDomain, mappingRequestDomain) {
        let attributes = {},
            filterData = {};

        // If the source/domain belongs to business domain we need to pass entity type, if it belongs to the taxonomy domain we need to pass the rootexternalname attribute's value which will be rsInternalSourceType/rsInternalTargetType
        // TODO: While searching we need to add the contextData as well?
        const sourceAttribute = sourceDomain?.hasClassifications
            ? 'rsInternalSourceType'
            : 'rsInternalSourceEntityTypeExternalName';
        const targetAttribute = targetDomain?.hasClassifications
            ? 'rsInternalTargetType'
            : 'rsInternalTargetEntityTypeExternalName';

        // The variables are wrapped inside quotes to make the search criteria as exact
        attributes[sourceAttribute] = '"' + sourceType + '"';
        attributes[targetAttribute] = '"' + targetType + '"';
        attributes.rsInternalStatus = this.mappingRequestStatus;

        filterData.attributes = attributes;
        filterData.entityTypes = [
            {
                internal: this.mappingRequestType,
                external: this.mappingRequestExternalName,
                domain: mappingRequestDomain
            }
        ];
        return filterData;
    }

    /**
     * Function to get all the pending mapping requests
     */
    static async getPendingMappingRequests(mappedRelationship, mappedContext, sourceId) {
        let contextData = {};
        const attributeNames = [
            'rsInternalTarget',
            'rsInternalSource',
            'rsInternalContextInfo',
            'rsInternalRequestType',
            'rsInternalRelationship'
        ];
        const itemContext = [
            {
                type: this.mappingRequestType,
                attributeNames: attributeNames
            }
        ];

        let attributesCriterion = [
            {
                rsInternalRelationship: {
                    exact: mappedRelationship
                }
            },
            {
                rsInternalStatus: {
                    exact: this.mappingRequestStatus
                }
            }
        ];

        if (!ObjectUtils.isEmpty(mappedContext)) {
            attributesCriterion.push({
                rsInternalContextInfo: {
                    exact: mappedContext
                }
            });
        }

        if(!ObjectUtils.isEmpty(sourceId)){
            attributesCriterion.push({
                rsInternalSource: {
                    exact: sourceId
                }
            });
        }

        contextData[ContextUtils.CONTEXT_TYPE_ITEM] = itemContext;
        contextData[ContextUtils.CONTEXT_TYPE_VALUE] = [DALCommonUtils.getDefaultValContext()];

        const entityGetRequest = DataRequestHelper.createEntityGetRequest(contextData);
        entityGetRequest.params.query.filters.attributesCriterion = attributesCriterion;

        const entityGetResponse = await this.getItemsForGivenRequest(entityGetRequest);

        return entityGetResponse?.content?.entities || [];
    }

    /**
     * Function to check whether a mapping request already exists for the selected source Id and target Id
     */
    static isAnExistingMappingRequest(
        currentSourceId,
        currentTargetId,
        currentContext,
        currentRequestType,
        currentRelationship,
        pendingMappingRequests
    ) {
        for (let mappingRequest of pendingMappingRequests) {
            const attributes = mappingRequest?.data?.attributes;
            const sourceId = AttributeUtils.getFirstAttributeValue(attributes?.rsInternalSource);
            const targetId = AttributeUtils.getFirstAttributeValue(attributes?.rsInternalTarget);
            const contextInfo = AttributeUtils.getFirstAttributeValue(attributes?.rsInternalContextInfo);
            const requestType = AttributeUtils.getFirstAttributeValue(attributes?.rsInternalRequestType);
            const relationship = AttributeUtils.getFirstAttributeValue(attributes?.rsInternalRelationship);

            if (
                currentSourceId === sourceId &&
                currentTargetId === targetId &&
                currentRequestType === requestType &&
                currentRelationship === relationship
            ) {
                if (!ObjectUtils.isEmpty(currentContext)) {
                    if (currentContext === contextInfo) {
                        return true;
                    }
                    // If context doesn't match, then continue without returning because we need to check other pending MRs as well.
                    continue;
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Function to convert an object to string
     */
    static objToString(obj) {
        const [objString] = Object.entries(obj).map(([key, value]) => `${key}:${value}`);
        return objString;
    }

    /**
     * Function to build keywordsCriterion from the given search text
     */
    static buildKeywordsCriterion(searchQuery) {
        let keywordsCriterion = {};
        if (!ObjectUtils.isEmpty(searchQuery)) {
            let searchCriteria = DataHelper.getSearchCriteria(searchQuery);
            keywordsCriterion.keywords = searchCriteria.keywords;
            keywordsCriterion.operator = '_AND';
        }
        return keywordsCriterion;
    }

    static async mappingRequestExists(sourceId, relationship, contextInfo){
        // Need to convert to string as context info is stored in string format in a Mapping Request
        if(!ObjectUtils.isEmpty(contextInfo)){
            contextInfo = this.objToString(contextInfo);
        }

        const pendingMappingRequests = await this.getPendingMappingRequests(relationship, contextInfo, sourceId);
        const isAnExistingMappingRequest = !ObjectUtils.isEmpty(pendingMappingRequests) ? true : false;
        return isAnExistingMappingRequest;
    }

    static async isSourceMappedToTarget(sourceId, sourceType, targetType, relationship, contextInfo){
        let contextData = {};
        const itemContext = [
            {
                type: targetType
            }
        ];

        const relationshipsCriterion = [
            {
                [relationship]: {
                    relTo: {
                        id: sourceId,
                        type: sourceType
                    }
                }
            }
        ];

        const isValidContextInfo = !ObjectUtils.isEmpty(contextInfo) && !this.isGlobalContext(contextInfo);
        if (isValidContextInfo) {
            contextData[ContextUtils.CONTEXT_TYPE_DATA] = [contextInfo];
        }

        contextData[ContextUtils.CONTEXT_TYPE_ITEM] = itemContext;
        contextData[ContextUtils.CONTEXT_TYPE_VALUE] = [DALCommonUtils.getDefaultValContext()];

        const entityGetRequest = DataRequestHelper.createEntityGetRequest(contextData);
        entityGetRequest.params.query.filters.relationshipsCriterion = relationshipsCriterion;
        if(isValidContextInfo){
            entityGetRequest.params.query.filters.nonContextual = false;
        }

        const entityGetResponse = await this.getItemsForGivenRequest(entityGetRequest);
        const isSourceMapped = !ObjectUtils.isEmpty(entityGetResponse?.content?.entities) ? true : false;
        return isSourceMapped;
    }

    static isGlobalContext(context) {
        const ctxType = Object.keys(context)[0];
        return ctxType === DataHelper.getGlobalContext()?.type;
    }

    /****************************** Function used in mapped filter *********************************/
    /**
     * Function to get the mapped items for source grid
     */
    static async getSourceMappedItems(
        request,
        relationshipName,
        relToType,
        attributeName,
        targetType,
        searchText,
        targetEntityType,
        targetContext
    ) {
        let entityGetResponse = await this.getItemsForSourceMappedFilter(
            request,
            relationshipName,
            relToType,
            attributeName,
            targetType,
            false,
            searchText,
            targetEntityType,
            targetContext
        );
        return entityGetResponse;
    }

    /**
     * Function to get the mapped/unmapped items for source grid
     * Step 1: Use the selected source Type to fetch all entities
     * Step 2: Use the ids from step 1 response, in the mappedto relationship criteria of the target type to find out if they are mapped
     */
    static async getItemsForSourceMappedFilter(
        request,
        relationshipName,
        relToType,
        attributeName,
        targetType,
        isUnMapped,
        searchText,
        targetEntityType,
        targetContext
    ) {
        let entitiesGetRequest = ObjectUtils.cloneObject(request);
        const isSourceGrid = true;
        let entityGetResponse = await this.getItemsForGivenRequest(entitiesGetRequest, searchText, isSourceGrid);
        if (ObjectUtils.isValidObjectPath(entityGetResponse, 'content.entities')) {
            let entityIds = _.pluck(entityGetResponse.content.entities, 'id');
            if (!ObjectUtils.isEmpty(entityIds)) {
                let mappedUnderTargetEntitiesGetRequest = ObjectUtils.cloneObject(request);

                // For step 2, to get the relTo ids, the type in typesCriterion should be target's selected entity type and relTo type should be the source selected entity type. Hence we are altering the request here.

                mappedUnderTargetEntitiesGetRequest.params.query.filters.typesCriterion = [targetEntityType];
                mappedUnderTargetEntitiesGetRequest.params.query.filters.attributesCriterion = [];
                let _attributesCriterionObj = {};

                // If there is no classificationAttributeName, it means the selected domain in target grid is a business domain. Attributes criterion is not required for biz domain.
                if (!ObjectUtils.isEmpty(attributeName)) {
                    _attributesCriterionObj[attributeName] = {
                        exact: targetType,
                        type: '_STRING'
                    };

                    mappedUnderTargetEntitiesGetRequest.params.query.filters.attributesCriterion.push(
                        _attributesCriterionObj
                    );
                }

                let _relationshipsCriterionObj = {};
                _relationshipsCriterionObj[relationshipName] = {
                    relTo: {
                        type: relToType,
                        ids: entityIds
                    }
                };

                if (!mappedUnderTargetEntitiesGetRequest.params.query.filters.relationshipsCriterion) {
                    mappedUnderTargetEntitiesGetRequest.params.query.filters.relationshipsCriterion = [];
                }

                // There should be nothing else in the relationships criterion except for the criterion which we build in this method, hence instead of pushing the obj we are assigning.
                mappedUnderTargetEntitiesGetRequest.params.query.filters.relationshipsCriterion = [
                    _relationshipsCriterionObj
                ];
                mappedUnderTargetEntitiesGetRequest.params.fields = {};
                mappedUnderTargetEntitiesGetRequest.params.fields.relationships = [relationshipName];

                // relAttributes are not used, hence sending an empty array
                mappedUnderTargetEntitiesGetRequest.params.fields.relationshipAttributes = [];

                //Removing the keyword search as it is taken care in the first round of filtering itself
                if (
                    ObjectUtils.isValidObjectPath(
                        mappedUnderTargetEntitiesGetRequest,
                        'params.query.filters.keywordsCriterion'
                    )
                ) {
                    delete mappedUnderTargetEntitiesGetRequest.params.query.filters.keywordsCriterion;
                }

                // Since the 2nd step innvolves getting the target items, we need to remove the context info from the request as the request was initially built for source grid.
                if (ObjectUtils.isValidObjectPath(mappedUnderTargetEntitiesGetRequest, 'params.query.contexts')) {
                    delete mappedUnderTargetEntitiesGetRequest.params.query.contexts;
                    delete mappedUnderTargetEntitiesGetRequest.params.query.filters.nonContextual;
                }

                if (!ObjectUtils.isEmpty(targetContext)) {
                    mappedUnderTargetEntitiesGetRequest.params.query.contexts = [targetContext];
                    mappedUnderTargetEntitiesGetRequest.params.query.filters.nonContextual = false;
                }
                let mappedUnderTargetEntitiesGetResponse = await this.getItemsForGivenRequest(
                    mappedUnderTargetEntitiesGetRequest,
                    '',
                    isSourceGrid
                );
                let mappedRelIds = this.getMappedToRelIdsFromEntities(
                    mappedUnderTargetEntitiesGetResponse?.content?.entities,
                    relationshipName
                );
                entityGetResponse = this.getItemsFromIsMappedRelToIds(
                    entityGetResponse?.content?.entities,
                    mappedRelIds,
                    isUnMapped
                );
            }
        }
        return entityGetResponse;
    }

    /**
     * Function to get the mapped/unmapped items for source grid
     */
    static getItemsFromIsMappedRelToIds(entities, mappedRelIds, isUnMapped) {
        let mappedEntities = [];
        let unMappedEntities = [];
        if (!ObjectUtils.isEmpty(entities)) {
            entities.forEach(function (entity) {
                if (entity && mappedRelIds.includes(entity.id)) {
                    mappedEntities.push(entity);
                } else {
                    unMappedEntities.push(entity);
                }
            });
        }

        //Adding the resultRecordSize for source grid item count
        let response = {
            resultRecordSize: mappedEntities.length ? mappedEntities.length : 0,
            content: {
                entities: mappedEntities
            }
        };
        if (isUnMapped) {
            response.content.entities = [];
            response.resultRecordSize = unMappedEntities.length ? unMappedEntities.length : 0;
            response.content.entities = unMappedEntities;
        }

        return response;
    }

    /**
     * Function to get the unmapped items for source grid
     */
    static async getSourceUnMappedItems(
        request,
        relationshipName,
        relToType,
        attributeName,
        targetType,
        searchText,
        targetEntityType,
        targetContext
    ) {
        let entityGetResponse = await this.getItemsForSourceMappedFilter(
            request,
            relationshipName,
            relToType,
            attributeName,
            targetType,
            true,
            searchText,
            targetEntityType,
            targetContext
        );
        return entityGetResponse;
    }

    /**
     * Function to get the mapped items for the target
     * Step 1: Use the selected target Type to fetch all mapped to relationships
     * Step 2: Use the ids from step 1 response, to fetch the mapped entities which are under targetType
     */
    static async getTargetMappedItems(request, relationshipName, relToType, searchText, targetContext) {
        let mappedEntitiesGetRequest = ObjectUtils.cloneObject(request);
        //Build the request to fetch all entities with ismappedto relationships
        if (mappedEntitiesGetRequest) {
            let _relationshipsCriterionObj = {};
            _relationshipsCriterionObj[relationshipName] = {
                relTo: {
                    type: relToType
                }
            };

            if (!mappedEntitiesGetRequest.params.query.filters.relationshipsCriterion) {
                mappedEntitiesGetRequest.params.query.filters.relationshipsCriterion = [];
            }
            mappedEntitiesGetRequest.params.fields = {};
            mappedEntitiesGetRequest.params.fields.relationships = [relationshipName];
            // relationship attributes are not required in relmapping
            mappedEntitiesGetRequest.params.fields.relationshipAttributes = [];
            mappedEntitiesGetRequest.params.query.filters.relationshipsCriterion.push(_relationshipsCriterionObj);
        }

        let mappedEntitiesGetResponse = await this.getItemsForGivenRequest(mappedEntitiesGetRequest);
        if (ObjectUtils.isValidObjectPath(mappedEntitiesGetResponse, 'content.entities')) {
            let mappedEntities = mappedEntitiesGetResponse.content.entities;
            // If context is selected, then filter out the entities which don't have relationships at the context level
            if (!ObjectUtils.isEmpty(targetContext)) {
                mappedEntities = mappedEntities.filter(entity => {
                    const relToIds = this.getMappedToRelIdsFromEntities([entity], relationshipName);
                    return !ObjectUtils.isEmpty(relToIds);
                });
            }
            const mappedEntityIds = _.pluck(mappedEntities, 'id');
            if (!ObjectUtils.isEmpty(mappedEntityIds)) {
                let mappedUnderSourceEntitiesGetRequest = ObjectUtils.cloneObject(request);
                mappedUnderSourceEntitiesGetRequest.params.query.ids = mappedEntityIds;
                let mappedUnderSourceEntitiesGetResponse = await this.getItemsForGivenRequest(
                    mappedUnderSourceEntitiesGetRequest,
                    searchText
                );
                return mappedUnderSourceEntitiesGetResponse;
            }
        }
        return [];
    }

    /**
     * Function to get the relIds in the entities
     */
    static getMappedToRelIdsFromEntities(entities, relName, relToType) {
        let relIds = [];
        if (!ObjectUtils.isEmpty(entities)) {
            entities.forEach(function (entity) {
                let relToObjs = [];
                // If context info is present in the entity data, then pluck the relTo ids from there and not from global.
                if (entity && ObjectUtils.isValidObjectPath(entity, `data.contexts.0.relationships.${relName}`)) {
                    let relationshipsInfo = entity.data.contexts[0].relationships[relName];

                    // In the contexts, because of coalescing we will have relationships which were created at global level. Since we don't want to render these coalesced relationships at context level, filter them out using the os property.
                    relationshipsInfo = relationshipsInfo.filter(relItem => relItem?.os !== 'contextCoalesce');
                    relToObjs = _.pluck(relationshipsInfo, 'relTo');
                }
                // Only if there is no context info in entity data pluck relToIds from global.
                else if (entity && ObjectUtils.isValidObjectPath(entity, `data.relationships.${relName}`)) {
                    relToObjs = _.pluck(entity.data.relationships[relName], 'relTo');
                }
                let entityRelIds = [];
                if (relToType) {
                    relToObjs = relToObjs.filter(rel => rel.type === relToType);
                }
                entityRelIds = _.pluck(relToObjs, 'id');
                relIds = _.union(relIds, entityRelIds);
            });
        }
        return relIds;
    }

    /**
     * Function to get the unmapped target entities
     *
     * If sourcetype belongs to business domain, the request is straightforward, we can use hasvalue: false in relationship criterion for the selected relationship.
     *
     * If the sourcetype belongs to taxonomy, we need to check whether the type of the relTo entity is same as the source type before considering the target entity as mapped/unmapped.
     * For that case we need to handle the request differently.
     * 1. Get all the target entities. If the target entity doesn't have ismappedto relationship, add it directly to unmappedItems list.
     * 2. If target entity has an ismappedto relationship but the type of relTo entity is not same as source type, add it to unmappedItems list else ignore it.
     *
     */
    static async getTargetUnMappedItems(request, relationshipName, searchText, sourceDomain, sourceType) {
        let unmappedEntitiesGetRequest = ObjectUtils.cloneObject(request);
        //Build the request to fetch all entities with ismappedto relationships
        if (sourceDomain?.hasClassifications) {
            let data = {
                content: {
                    entities: []
                }
            };

            const unmappedEntitiesGetResponse = await this.getItemsForGivenRequest(
                unmappedEntitiesGetRequest,
                searchText
            );
            const targetEntities = unmappedEntitiesGetResponse?.content?.entities || [];
            let unmappedItems = [];
            for (let entity of targetEntities) {
                if (ObjectUtils.isValidObjectPath(entity, `data.relationships.${relationshipName}`)) {
                    let mappedIds = this.getMappedToRelIdsFromEntities([entity], relationshipName);

                    if (!ObjectUtils.isEmpty(mappedIds)) {
                        let isUnMappedEntity = true;
                        for (let mappedId of mappedIds) {
                            isUnMappedEntity = true;
                            const classificationAttributeName =
                                sourceDomain?.classificationAttributeName || 'rootexternalname';
                            let contextData = {};
                            const itemContext = [
                                {
                                    type: sourceDomain?.manageModelName,
                                    id: mappedId,
                                    attributeNames: [classificationAttributeName]
                                }
                            ];

                            contextData[ContextUtils.CONTEXT_TYPE_ITEM] = itemContext;
                            contextData[ContextUtils.CONTEXT_TYPE_VALUE] = [DALCommonUtils.getDefaultValContext()];
                            const entityGetRequest = DataRequestHelper.createEntityGetRequest(contextData);
                            const entityGetResponse = await this.getItemsForGivenRequest(entityGetRequest);
                            const mappedEntity = entityGetResponse?.content?.entities?.[0] || {};
                            if (
                                ObjectUtils.isValidObjectPath(
                                    mappedEntity,
                                    `data.attributes.${classificationAttributeName}`
                                )
                            ) {
                                // If entity has an ismappedto relationship, but type of relTo entity (mappedEntity) is not same as source, then add the entity to unmapped.
                                if (
                                    AttributeUtils.getFirstAttributeValue(
                                        mappedEntity.data.attributes[classificationAttributeName]
                                    ) === sourceType
                                ) {
                                    isUnMappedEntity = false;
                                }
                            }
                        }
                        if (isUnMappedEntity) {
                            unmappedItems.push(entity);
                        }
                    }
                }
                // If mapped entity doesn't have ismappedto relationship, directly push it to unmapped items.
                else {
                    unmappedItems.push(entity);
                }
            }
            data.content.entities = unmappedItems;
            return data;
        } else {
            if (unmappedEntitiesGetRequest) {
                let _relationshipsCriterionObj = {};
                _relationshipsCriterionObj[relationshipName] = {
                    hasvalue: false
                };

                if (!unmappedEntitiesGetRequest.params.query.filters.relationshipsCriterion) {
                    unmappedEntitiesGetRequest.params.query.filters.relationshipsCriterion = [];
                }
                unmappedEntitiesGetRequest.params.query.filters.relationshipsCriterion = [_relationshipsCriterionObj];
            }

            let unmappedEntitiesGetResponse = await this.getItemsForGivenRequest(
                unmappedEntitiesGetRequest,
                searchText
            );
            return unmappedEntitiesGetResponse;
        }
    }

    /**
     * Function to get all the items for the given request
     */
    static async getItemsForGivenRequest(request, searchText, isSourceGrid) {
        //If searchText is given, build the keyword criterion
        if (searchText) {
            let keywordsCriterion = this.buildKeywordsCriterion(searchText);
            if (!ObjectUtils.isEmpty(keywordsCriterion)) {
                request.params.query.filters.keywordsCriterion = keywordsCriterion;
            }
        }

        const config = isSourceGrid ? this.config?.source : this.config?.target;
        const batchSize = config?.batchSize || 50;
        const pageSize = config?.pageSize || 50;

        // If the response is more than 5MB, API won't return the data. In that case, we can reduced the batch and pagesize from the configs and fetch data.
        const requestOptions = {
            startRow: 0,
            endRow: pageSize,
            maxRecords: pageSize
        };
        const reqOpt = DataRequestHelper.getRequestOption(requestOptions);
        request.params.options = reqOpt;

        // dalReqOptions.batchSize helps in getting data in batches. This reduces the load on the system and is an optimized way of fetching the data.
        let dalReqOptions = {};
        dalReqOptions.batchSize = batchSize;
        dalReqOptions.objectsCollectionName = 'entities';
        dalReqOptions.dataIndex = 'entityData';

        let getRequest = DataObjectManager.createRequest('searchandget', request, '', dalReqOptions);
        let getResponse = await DataObjectManager.initiateRequest(getRequest);

        if (getResponse?.response?.status == 'success') {
            return getResponse.response;
        } else {
            LoggerManager.logError(this, 'Failed to get entities', getResponse.response);
        }
    }

    /****************************** End of functions used in mapped filter *********************************/
}
export default RelMappingHelper;
