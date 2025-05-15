import React from 'react'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function infoTag(passedProps) {
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {passedProps.text}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 100 }}
      overlay={renderTooltip}
    >
      <i className="bi bi-info-circle"></i>
    </OverlayTrigger>
  );
}
export default infoTag