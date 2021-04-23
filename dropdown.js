/*
  A Web Component select element
  inspired by: https://css-tricks.com/striking-a-balance-between-native-and-custom-select-elements/
*/

class CustomDropdown extends HTMLElement {
  constructor() {
    super();
    this.customSelectEl = null;
    this.customSelectListEl = null;
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    this.querySelector('select').addEventListener('invalid', this.onInvalid.bind(this));
  }

  static createCustomSelect() {
    const element = document.createElement('div');
    element.classList.add('i_select_custom');
    return element;
  }

  static createCustomSelectList() {
    const customSelectListEl = document.createElement('div');
    customSelectListEl.setAttribute('aria-hidden', 'true');
    customSelectListEl.classList.add('i_select--dropdown');
    return customSelectListEl;
  }

  connectedCallback() {
    this.createCustomSelect();
  }

  getNativeSelectOptions() {
    return this.querySelectorAll('option');
  }

  getCustomSelectOptions() {
    return this.customSelectListEl.querySelectorAll('.i_select--dropdown--item');
  }

  createCustomSelect() {
    this.customSelectEl = CustomDropdown.createCustomSelect();
    this.customSelectEl.addEventListener('click', this.openCustomSelect.bind(this));

    this.customSelectListEl = CustomDropdown.createCustomSelectList();
    this.getNativeSelectOptions().forEach((node) => {
      this.customSelectListEl.appendChild(this.createCustomSelectOption(node));
    });
    this.customSelectEl.appendChild(this.customSelectListEl);

    this.appendChild(this.customSelectEl);
  }

  createCustomSelectOption(node) {
    const optionEl = document.createElement('div');
    optionEl.classList.add('i_select--dropdown--item');
    optionEl.setAttribute('data-value', node.getAttribute('value'));
    optionEl.innerHTML = node.innerHTML;
    optionEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleOptionSelect(node);
    });
    optionEl.addEventListener('mouseenter', () => this.updateHovered(optionEl));
    return optionEl;
  }

  isOpen() {
    return this.customSelectListEl.classList.contains('i_select--dropdown-visible');
  }

  openCustomSelect() {
    if (this.isOpen()) {
      this.closeCustomSelect();
    } else {
      this.classList.add('i_select_custom-focused');
      this.resetHovered();
      this.customSelectListEl.classList.add('i_select--dropdown-visible');
      this.customSelectListEl.removeAttribute('aria-hidden');
    }
  }

  closeCustomSelect() {
    this.customSelectListEl.setAttribute('aria-hidden', 'true');
    this.classList.remove('i_select_custom-focused');
    this.customSelectListEl.classList.remove('i_select--dropdown-visible');
    this.resetHovered();
  }

  handleKeyPress(event) {
    const options = Array.from(this.getCustomSelectOptions());
    const active = options.find((el) => el.classList.contains('i_select--dropdown--item-hover'));
    if (event.keyCode === 40) {
      const indexToselect = options.indexOf(active) + 1;
      const nextIndex = indexToselect > options.length - 1
        ? options.length - 1
        : indexToselect;
      this.updateHovered(options[nextIndex]);
    }
    if (event.keyCode === 38) {
      const indexToSelect = options.indexOf(active) - 1;
      const prevIndex = indexToSelect < 0
        ? 0
        : indexToSelect;
      this.updateHovered(options[prevIndex]);
    }
    if (event.keyCode === 13 || event.keyCode === 32) {
      const nativeOption = Array.from(this.getNativeSelectOptions()).find((el) => el.value === active.getAttribute('data-value'));
      this.handleOptionSelect(nativeOption);
    }
    if (event.keyCode === 27) {
      this.closeCustomSelect();
    }
  }

  handleOutsideClick(event) {
    if (!this.customSelectEl.contains(event.target)) {
      this.closeCustomSelect();
    }
  }

  handleOptionSelect(nativeNode) {
    this.resetNativeSelectedOptions();
    nativeNode.setAttribute('selected', '');
    this.updateLabelStyle();
    this.closeCustomSelect();
  }

  onInvalid(event) {
    event.preventDefault();
    this.classList.add('i_select_custom-invalid');
    this.updateLabelStyle();
  }

  resetNativeSelectedOptions() {
    this.getNativeSelectOptions().forEach((node) => node.removeAttribute('selected'));
  }

  resetHovered() {
    const selectedElement = Array.from(this.getNativeSelectOptions()).find((el) => el.selected);
    this.getCustomSelectOptions().forEach((cel) => {
      if (cel.getAttribute('data-value') === selectedElement.getAttribute('value')) {
        cel.classList.add('i_select--dropdown--item-hover');
      } else {
        cel.classList.remove('i_select--dropdown--item-hover');
      }
    });
  }

  updateHovered(optionEl) {
    this.getCustomSelectOptions().forEach((el) => {
      el.classList.remove('i_select--dropdown--item-hover');
    });
    optionEl.classList.add('i_select--dropdown--item-hover');
  }

  updateLabelStyle() {
    if (!this.querySelector('select').validity.valid) {
      this.querySelector('label').classList.add('i_label-invalid');
    } else if (this.querySelector('select').value) {
      this.querySelector('label').classList.add('i_label-has_value');
    } else {
      this.querySelector('label').classList.remove('i_label-has_value');
    }
  }
}
if ('customElements' in window) {
  customElements.define('custom-dropdown', CustomDropdown);
}
