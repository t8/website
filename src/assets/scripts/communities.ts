import 'threads/register';

import '../styles/style.scss';
import $ from './libs/jquery';
import './global';
import arweave from './libs/arweave';
import Community from 'community-js';
import GQLResultInterface from './interfaces/gqlResult';
import { StateInterface } from 'community-js/lib/faces';
import { ModuleThread, spawn } from 'threads';
import { TokensWorker } from './workers/tokens';
import Author from './models/author';
import AuthorInterface from './interfaces/author';
import Opportunities from './models/opportunities';
import Utils from './utils/utils';

const getAllCommunityIds = async (): Promise<string[]> => {
  let cursor = '';
  let hasNextPage = true;

  let ids: string[] = [];
  while (hasNextPage) {
    const query = {
      query: `query {
        transactions(
          tags: [
            {name: "App-Name", values: ["SmartWeaveContract"]},
            {name: "Contract-Src", values: ["ngMml4jmlxu0umpiQCsHgPX2pb_Yz6YDB8f7G6j-tpI"]}
          ]
          after: "${cursor}"
          first: 100
        ) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              recipient
              quantity {
                ar
              }
              owner {
                address
              },
              tags {
                name,
                value
              }
              block {
                timestamp
                height
              }
            }
          }
        }
      }`,
    };
    const res = await arweave.api.post('/graphql', query);
    const data: GQLResultInterface = res.data;

    for (let i = 0, j = data.data.transactions.edges.length; i < j; i++) {
      ids.push(data.data.transactions.edges[i].node.id);
    }
    hasNextPage = data.data.transactions.pageInfo.hasNextPage;

    if (hasNextPage) {
      cursor = data.data.transactions.edges[data.data.transactions.edges.length - 1].cursor;
    }
  }

  return ids;
};

const getAllOpportunities = async (commIds: string[]): Promise<{ [key: string]: number }> => {
  const res: { [key: string]: number } = {};

  const opps = new Opportunities();
  const oppsRes = await opps.getAllByCommunityIds(commIds);

  for (let i = 0; i < oppsRes.length; i++) {
    if (!res[oppsRes[i].community.id]) {
      res[oppsRes[i].community.id] = 0;
    }
    res[oppsRes[i].community.id]++;
  }

  return res;
};

const loadCards = async () => {
  const tokensWorker: ModuleThread<TokensWorker> = await spawn<TokensWorker>(new Worker('./workers/tokens.ts'));

  const commIds: string[] = await getAllCommunityIds();
  const opps: { [key: string]: number } = await getAllOpportunities(commIds);

  $('.total').text(commIds.length);
  $('.loaded').show();

  let list: { html: string; members: number; opportunities: number }[] = [];
  let current = -1;
  let completed = 0;

  const go = async (i = 0) => {
    if (i >= commIds.length) {
      return true;
    }

    const comm = commIds[i];
    let state: StateInterface;

    try {
      const community = new Community(arweave);
      await community.setCommunityTx(comm);
      state = await community.getState();
    } catch (e) {
      return go(++current);
    }

    const users = await tokensWorker.sortHoldersByBalance(state.balances, state.vault);

    let avatarList = '';
    const max = users.length > 5 ? 5 : users.length;
    for (let i = 0; i < max; i++) {
      const author = new Author(null, users[i].address, null);
      const aDetails: AuthorInterface = await author.getDetails();
      avatarList += `<span class="avatar" data-toggle="tooltip" data-placement="top" title="${aDetails.address}" data-original-title="${aDetails.address}" style="background-image: url(${aDetails.avatar})"></span>`;
    }

    const oppsTotal = opps[commIds[i]] ? opps[commIds[i]] : 0;

    let logo = state.settings.get('communityLogo');
    if (logo && logo.length) {
      const config = arweave.api.getConfig();
      logo = `${config.protocol}://${config.host}:${config.port}/${logo}`;
    } else {
      logo = Utils.generateIcon(comm, 72);
    }

    const oppTxt = oppsTotal === 1 ? 'Opportunity' : 'Opportunities';
    list.push({
      html: `
      <div class="col-md-6">
        <a class="card" href="./index.html#${comm}" data-community="${comm}" target="_blank">
          <div class="card-body text-center">
            <div class="mb-3">
              <span class="avatar avatar-lg rounded" style="background-image: url(${logo})"></span>
            </div>
            <h4 class="card-title m-0">${state.name} (${state.ticker})</h4>
            <div class="text-muted">${comm}</div>
            <small class="opps">${oppsTotal} ${oppTxt}</small> | 
            <small class="members">${users.length} Members</small><br>
            <div class="avatar-list avatar-list-stacked mt-3 mb-3">
              ${avatarList}
            </div>
          </div>
        </a>
      </div>
      `,
      members: users.length,
      opportunities: oppsTotal,
    });

    $('.completed').text(++completed);
    $('.progress-bar').width(`${Math.floor((completed / commIds.length) * 100)}%`);

    return go(++current);
  };

  const gos = [];
  for (let i = 0, j = 5; i < j; i++) {
    gos.push(go(++current));
  }

  await Promise.all(gos);
  $('.opps-cards').html(
    list
      .sort((a, b) => b.members + b.opportunities - (a.members + a.opportunities))
      .map((a) => a.html)
      .join(''),
  );
  // @ts-ignore
  $('[data-toggle="tooltip"]').tooltip();
};

$(() => {
  $('a.create').attr('href', './create.html');
  $('a.opp').attr('href', './opportunity.html');
  $('a.home').attr('href', './home.html');

  loadCards();
});
