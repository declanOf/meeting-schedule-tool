class SectionControls
{
    #section;

    #key;

    #template;

    #meetings;

    constructor(meetings, section, key)
    {
        this.#template = sectionControlsTemplate;

        this.#meetings = meetings;

        this.#section = section;

        this.#key = key;
    }

    getFiltersContent()
    {
        const filters = new Filters(this.#meetings, this.#section.filter);

        filters.prefix = `sections.${this.#key}.`;
        return filters.render();
    }

    render()
    {
        const filtersContent = this.getFiltersContent();

        const sectionControlsTemplateEngine = Handlebars.compile(sectionControlsTemplate);

        return sectionControlsTemplateEngine({
            "section": this.#section,
            "columns": this.#section.columns,
            "arrayOfColumns": Array.isArray(this.#section.columns[0]),
            "filtersContent": filtersContent,
            sectionKey: this.#key
        });
    }
}