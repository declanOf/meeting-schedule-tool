class GenericBlockSection
{
    #meetings;

    #section;

    #displayFriendlyRows;

    #sectionIndex;

    constructor(meetings, section, sectionIndex, configuration)
    {
        this.#meetings = meetings;

        this.#section = section;

        this.#sectionIndex = sectionIndex;

        this.#meetings = GenericBlockSection_Filter.filter(this.#meetings, this.#section);
    }

    get section()
    {
        return this.#section;
    }

    get sectionIndex()
    {
        return this.#sectionIndex;
    }

    get meetings()
    {
        return this.#meetings;
    }

    set meetings(meetings)
    {
        this.#meetings = meetings;
    }

    render()
    {
        let content = `<table class="meetings ${configuration.settings.meetingFontSize}" data-index="${this.sectionIndex}">${this.displayFriendlyRows}</table>`;

        if (this.#section.footer) {
            content += `<p
                class="${configuration.settings.footerFontSize} text-center"
                style="margin-bottom: 0rem">${this.#section.footer}</p>`;
        }

        return content;
    }

    get displayFriendlyRows()
    {
        const rowHelper = new RowHelper(this.meetings, this.section);

        return `${rowHelper.headerRow} ${rowHelper.displayFriendlyRows}`;
    }
};
