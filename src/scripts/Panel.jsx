class Panel extends React.Component{
  render() {
    return <div className="panel">
    	<div className="header">
    		{this.props.title}
    	</div>
    	{this.props.children}
    </div>;
  }
}