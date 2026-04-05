const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'my-app-2ddc5-2-service',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createUserRef(dcInstance, inputVars));
}
;

const getUserByUidRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByUid', inputVars);
}
getUserByUidRef.operationName = 'GetUserByUid';
exports.getUserByUidRef = getUserByUidRef;

exports.getUserByUid = function getUserByUid(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUserByUidRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const upsertUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUserProfile', inputVars);
}
upsertUserProfileRef.operationName = 'UpsertUserProfile';
exports.upsertUserProfileRef = upsertUserProfileRef;

exports.upsertUserProfile = function upsertUserProfile(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertUserProfileRef(dcInstance, inputVars));
}
;

const createLegalAidCenterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLegalAidCenter', inputVars);
}
createLegalAidCenterRef.operationName = 'CreateLegalAidCenter';
exports.createLegalAidCenterRef = createLegalAidCenterRef;

exports.createLegalAidCenter = function createLegalAidCenter(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createLegalAidCenterRef(dcInstance, inputVars));
}
;

const createUserQueryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUserQuery', inputVars);
}
createUserQueryRef.operationName = 'CreateUserQuery';
exports.createUserQueryRef = createUserQueryRef;

exports.createUserQuery = function createUserQuery(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createUserQueryRef(dcInstance, inputVars));
}
;

const createAppointmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAppointment', inputVars);
}
createAppointmentRef.operationName = 'CreateAppointment';
exports.createAppointmentRef = createAppointmentRef;

exports.createAppointment = function createAppointment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAppointmentRef(dcInstance, inputVars));
}
;

const createAppointmentWithCenterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAppointmentWithCenter', inputVars);
}
createAppointmentWithCenterRef.operationName = 'CreateAppointmentWithCenter';
exports.createAppointmentWithCenterRef = createAppointmentWithCenterRef;

exports.createAppointmentWithCenter = function createAppointmentWithCenter(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAppointmentWithCenterRef(dcInstance, inputVars));
}
;

const listAppointmentsByUserIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAppointmentsByUserId', inputVars);
}
listAppointmentsByUserIdRef.operationName = 'ListAppointmentsByUserId';
exports.listAppointmentsByUserIdRef = listAppointmentsByUserIdRef;

exports.listAppointmentsByUserId = function listAppointmentsByUserId(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAppointmentsByUserIdRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listLegalAidCentersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListLegalAidCenters', inputVars);
}
listLegalAidCentersRef.operationName = 'ListLegalAidCenters';
exports.listLegalAidCentersRef = listLegalAidCentersRef;

exports.listLegalAidCenters = function listLegalAidCenters(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listLegalAidCentersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const deleteAppointmentByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAppointmentById', inputVars);
}
deleteAppointmentByIdRef.operationName = 'DeleteAppointmentById';
exports.deleteAppointmentByIdRef = deleteAppointmentByIdRef;

exports.deleteAppointmentById = function deleteAppointmentById(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteAppointmentByIdRef(dcInstance, inputVars));
}
;

const createLegalChunkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLegalChunk', inputVars);
}
createLegalChunkRef.operationName = 'CreateLegalChunk';
exports.createLegalChunkRef = createLegalChunkRef;

exports.createLegalChunk = function createLegalChunk(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createLegalChunkRef(dcInstance, inputVars));
}
;

const searchLegalChunksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchLegalChunks', inputVars);
}
searchLegalChunksRef.operationName = 'SearchLegalChunks';
exports.searchLegalChunksRef = searchLegalChunksRef;

exports.searchLegalChunks = function searchLegalChunks(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(searchLegalChunksRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const searchLegalChunksByLawRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchLegalChunksByLaw', inputVars);
}
searchLegalChunksByLawRef.operationName = 'SearchLegalChunksByLaw';
exports.searchLegalChunksByLawRef = searchLegalChunksByLawRef;

exports.searchLegalChunksByLaw = function searchLegalChunksByLaw(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(searchLegalChunksByLawRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listLegalChunksByLawRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListLegalChunksByLaw', inputVars);
}
listLegalChunksByLawRef.operationName = 'ListLegalChunksByLaw';
exports.listLegalChunksByLawRef = listLegalChunksByLawRef;

exports.listLegalChunksByLaw = function listLegalChunksByLaw(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listLegalChunksByLawRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;
