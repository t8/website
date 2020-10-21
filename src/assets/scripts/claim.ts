import "../styles/style.scss";
import "bootstrap/dist/js/bootstrap.bundle";

import $ from './libs/jquery';
import './global';
import Community from "community-js";
import arweave from "./libs/arweave";
import Account from "./models/account";

const community = new Community(arweave);
const account = new Account(community);

function copyToClipboard(str: string) {
  const $temp = $("<input>");
  $("body").append($temp);
  $temp.val(str).select();
  document.execCommand("copy");
  $temp.remove();

  alert('Copied!');
}

// @ts-ignore
window.currentPage = { 
  syncPageState: async () => {
    if(await account.isLoggedIn()) {
      $('.logged-in-addy').text(await account.getAddress());
      $('.ref-link').text(`https://community.xyz/airdrop#${await account.getAddress()}`);
      $('.logged-in').show();
    } else {
      $('.logged-out').hide();
    }
  }
};

$(() => {
  $('a.home').attr('href', '/home.html');
  $('a.create').attr('href', './create.html');
  $('a.opp').attr('href', './opportunity.html');
  $('a.comms').attr('href', './communities.html');
  $('a.ref-link').on('click', e => {
    e.preventDefault();

    copyToClipboard($('a.ref-link').text().toString().trim());
  });

  $('.claim').on('click', async e => {
    e.preventDefault();

    $(e.target).addClass('btn-loading disabled');
    $.get(`./completeairdrop/${await account.getAddress()}/${document.location.hash.replace('#', '').trim()}`, res => {
      if(res === 'OK') {
        alert('Tokens claimed!');
      } else if(res === 'DONE') {
        alert('Tokens already claimed!');
      } else {
        alert(res);
      }

      $(e.target).removeClass('btn-loading');
    });
  });

  account.init();
});