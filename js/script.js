class FavoriteCategory {
    constructor(element) {
        this.element = element;
        this.wrapper = this.element.querySelector('.favorite-category-wrapper__control-checkboxes');
        this.buttonContainer = this.element.querySelector('.favorite-category-wrapper__control-button');
        this.maxSelected = 4;
        this.selectedCount = 0;
        this.response();
        this.preventManualDisableChange();
    }

    async response() {
        try {
            const res = await fetch('../obj.json');
            if (!res.ok) return;
            const data = await res.json();

            data.lps.forEach(category => this.renderCategories(category));
            this.countSelectedCheckboxes();
            this.toggleSelectButton();
            this.setupCheckboxListeners();
        } catch (error) {
            console.error(error);
        }
    }

    renderCategories({ Id, Description, Value, IsSelected }) {
        const template = `
            <label for="${Id}" class="favorite-category-wrapper__control-checkbox">
                <div class="favorite-category-wrapper__control-name">${Description}</div>
                <div class="favorite-category-wrapper__control-percent">${Value}%</div>
                <input type="checkbox" id="${Id}" ${IsSelected ? 'checked' : ''}>
                <div class="favorite-category-wrapper__control-checkbox-icon">
                    <i data-checked></i>
                </div>
            </label>
        `;
        this.wrapper.insertAdjacentHTML('beforeend', template);
    }

    openPopup() {
        const buttonPopup = document.getElementById('open-favorite-category-popup');
        if (buttonPopup) {
            buttonPopup.addEventListener('click', (e) => {
                e.preventDefault();
                this.element.querySelector('.favorite-category').classList.add('visible');
                this.togglePopup();
            });
            this.closeBackgroundPopup();
        }
    }

    closeBackgroundPopup() {
        this.element.querySelector('.favorite-category').addEventListener('click', (e) => {
            const isCheckbox = e.target.closest('.favorite-category-wrapper__control-checkbox') || e.target.closest('#checkbox-open');
            const isContent = e.target.closest('.favorite-category-wrapper__content');
            
            if (isContent) return;

            if (!isCheckbox) {
                toggler.closePopup();
            }
        });
    }

    closePopup() {
        const checkbox = this.element.querySelector('#checkbox-open');
        if (checkbox) checkbox.checked = false;
        setTimeout(() => {
            this.element.querySelector('.favorite-category').classList.remove('visible');
        }, 1000);
    }

    togglePopup() {
        const checkbox = this.element.querySelector('#checkbox-open');
        if (checkbox) checkbox.checked = !checkbox.checked;
    }

    test() {
        const close = this.element.querySelector('.favorite-category-wrapper__close');
            close.addEventListener('click', () => {
                setTimeout(() => {
                    this.element.querySelector('.favorite-category').classList.remove('visible');
                }, 1000);
        });
    }

    toggleSelectButton() {
        if (!this.buttonContainer) return;

        const checkboxes = this.wrapper.querySelectorAll('input[type="checkbox"]');
        const isAnyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

        this.buttonContainer.innerHTML = isAnyChecked 
            ? `<button type="button" class="active">Выбрать</button>` 
            : `<div>Выбрать</div>`;
    }

    setupCheckboxListeners() {
        const checkboxes = this.wrapper.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateSelectedCount(e.target);
                this.toggleSelectButton();
            });
        });
    }

    countSelectedCheckboxes() {
        const checkboxes = this.wrapper.querySelectorAll('input[type="checkbox"]');
        this.selectedCount = [...checkboxes].filter(cb => cb.checked).length;
        this.updateCheckboxState();
    }

    updateSelectedCount(checkbox) {
        this.selectedCount += checkbox.checked ? 1 : -1;
        this.updateCheckboxState();
    }

    updateCheckboxState() {
        const checkboxes = this.wrapper.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.disabled = this.selectedCount >= this.maxSelected && !cb.checked;
        });
    }

    preventManualDisableChange() {
        const observer = new MutationObserver(() => {
            const checkboxes = this.wrapper.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                if (!cb.disabled && this.selectedCount >= this.maxSelected && !cb.checked) {
                    cb.disabled = true;
                }
            });
        });

        observer.observe(this.wrapper, {
            childList: true, 
            subtree: true, 
            attributes: true,
            attributeFilter: ['disabled']
        });
    }
}

const toggler = new FavoriteCategory(document.getElementById('favorite-category__init'));
toggler.openPopup();
toggler.test()