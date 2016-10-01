class Editor extends React.Component{
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.marker = null;
    }

    onChange() {
        if (this.props.onChange) {
            var newValue = this.editor.getValue();
            this.props.onChange(newValue);
        }
    }

    init(element) {
        this.container = element;
    }

    setValue(value) {
        this.editor.setValue(value, -1);
    }

    componentDidMount() {
        this.editor = ace.edit(this.container);
        this.editor.getSession().setMode("ace/mode/" + this.props.mode);
        this.editor.setTheme("ace/theme/" + this.props.theme);
        this.editor.setShowPrintMargin(false);
        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: false,
            wrap: true,
            autoScrollEditorIntoView: true,
            fontFamily: "Fira  Code",
            showLineNumbers: true,
            showGutter: true
        });
        this.editor.$blockScrolling = Infinity;

        if (this.props.defaultValue){
            this.editor.setValue(this.props.defaultValue, -1);
        }

        this.editor.on("change", this.onChange);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.issues) {
            var annotations = nextProps.issues.map(issue => {
                let position = this.editor.session.doc.indexToPosition(issue.position);
                return {
                    row: position.row,
                    column: position.column,
                    text: issue.message,
                    type: issue.type
                }
            })

            this.editor.session.setAnnotations(annotations);
            this.editor.execCommand("goToNextError");
        } else {
            this.editor.session.clearAnnotations();
            this.editor.execCommand("goToNextError");
        }

        if (nextProps.value) {
            this.editor.setValue(nextProps.value, -1);
        }
    }

    render() {
        return <div ref={ (element) => this.init(element) }></div>;
    }
}