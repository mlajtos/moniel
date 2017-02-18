class Panel extends React.Component{
  render() {
    return <div id={this.props.id} className="panel">
    	{this.props.children}
    </div>;
  }
}