import fetch from 'isomorphic-fetch';
import { API_HOST } from '../';
import { playerCounts } from '../../reducers';
import { getUrl } from '../utility';
import constants from 'dotaconstants';

// const excludedOptions = ['limit'];
const url = playerId => `/api/players/${playerId}/counts`;

const REQUEST = 'yasp/playerCounts/REQUEST';
const OK = 'yasp/playerCounts/OK';
const ERROR = 'yasp/playerCounts/ERROR';
const SORT = 'yasp/playerCounts/SORT';

export const playerCountsActions = {
  REQUEST,
  OK,
  ERROR,
  SORT,
};

export const setPlayerCountsSort = (sortField, sortState, sortFn, id) => ({
  type: SORT,
  sortField,
  sortState,
  sortFn,
  id,
});

export const getPlayerCountsRequest = (id) => ({ type: REQUEST, id });

export const getPlayerCountsOk = (payload, id) => ({
  type: OK,
  payload,
  id,
});

export const getPlayerCountsError = (payload, id) => ({
  type: ERROR,
  payload,
  id,
});

export const getPlayerCounts = (playerId, options = {}, host = API_HOST) => (dispatch, getState) => {
  if (playerCounts.isLoaded(getState(), playerId)) {
    dispatch(getPlayerCountsOk(playerCounts.getCountsList(getState(), playerId), playerId));
  } else {
    dispatch(getPlayerCountsRequest(playerId));
  }
  // const modifiedOptions = getModifiedOptions(options, excludedOptions);

  return fetch(`${host}${getUrl(playerId, options, url)}`, { credentials: 'include' })
    .then(response => response.json())
    .then(json => {
      const data = {};
      Object.keys(json).forEach(key => {
        // We need to map each inner object to something we can understand
        data[key] = Object.keys(json[key]).map(innerKey => ({
          category: JSON.stringify(constants[key][innerKey]),
          matches: json[key][innerKey].games,
          winPercent: json[key][innerKey].win / json[key][innerKey].games,
        }));
      });
      return data;
    })
    .then(json => dispatch(getPlayerCountsOk(json, playerId)))
    .catch(error => dispatch(getPlayerCountsError(error, playerId)));
};
