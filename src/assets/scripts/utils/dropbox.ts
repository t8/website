import feather from 'feather-icons';
import Deferred from './deferred';
import arweave from '../libs/arweave';

export default class Dropbox {
  private $container: JQuery<HTMLElement>;
  private $elem: JQuery<HTMLElement>;
  private eventsStarted = false;
  private deferred: Deferred;

  constructor($container: JQuery<HTMLElement>) {
    this.$container = $container;
  }

  async show(text: string = 'Drag and drop a file or click here.', isWallet = false) {
    const klass = isWallet ? 'file-upload-default' : '';
    this.$elem = $(`
    <div class="col-12 deployer text-center">
      <input type="file" class="${klass}" />
      <span>${text}<span>
    </div>`);

    this.$container.empty().append(this.$elem);

    await this.events();

    this.deferred = new Deferred();
    return this.deferred.promise;
  }

  async showLogin() {
    return this.show('Drag and drop or click to login.', true);
  }

  private async events() {
    this.$elem.find('input[type="file"]').on('change', e => {
      e.stopPropagation();

      // @ts-ignore
      this.deferred.resolve(e);
    });
    this.$elem.on('dragenter, dragover', e => {
      this.$elem.addClass('highlight');
    }).on('dragleave, drop', e => {
      this.$elem.removeClass('highlight');
    });
  }
}