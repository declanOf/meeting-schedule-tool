class ConfigurationDeleteDialog
{
    #configuration;

    #configurationDeleteDialog;

    #configurationName;

    #configurationKey;

    constructor(configurationKey) {
        this.#configuration = new Configuration();

        this.#configurationKey = configurationKey;

        $("body").append(this.render());

        this.attachHandlers();

        this.#configurationDeleteDialog = $("#deleteConfigurationDialog").dialog({title: "Delete Configuration", height: 500, width: 450, autoOpen: false, modal: true});
    }

    open() {
        // TODO: reset dialog content

        $("#configurationDeleteDialog .errors").hide();

        this.#configurationDeleteDialog.dialog("open");
    }

    attachHandlers() {
        const submitHandler = (event) => {
            event.preventDefault();

            // delete here
            const formValues = $("#configurationRenameForm").serialize();

            const configurationKey = formValues.configurationKey;

            const configuration = new Configuration();

            const availableConfigurations = configuration.availableConfigurations;

            let newAvailableConfigurations = [];

            availableConfigurations.forEach((configuration) => {
                if (configurationKey !== configuration[0]) {
                    newAvailableConfigurations.push(configuration);
                }
            });

            debugger;

            localStorage.setItem("availableConfigurations", JSON.stringify(newAvailableConfigurations));

            localStorage.clear("settings-" + configurationKey);
            location.reload();
        }

        const cancelHandler = (event) => {
            event.preventDefault();

            $("#configurationDeleteDialog").dialog("close");
        };

        $("#configurationDeleteForm .submit").on("click", submitHandler);

        $("#configurationDeleteForm .cancel").on("click", cancelHandler);
    }

    render() {
        const configurationDeleteDialogEngine = Handlebars.compile(configurationDeleteDialogTemplate);

        let configurationName = '';

        this.#configuration.availableConfigurations.forEach((elem) => {
            if (this.#configurationKey === elem[0]) {
                configurationName = elem[1];
            }
        });

        return configurationDeleteDialogEngine({configurationKey: this.#configurationKey, configurationName: configurationName});
    }

}