import {Severity} from '../Models/Severity';
import {Report} from '../swagger';
import SeverityEnum = Report.SeverityEnum;

export const getSeverityText = (severity: SeverityEnum) => {
  switch (+severity) {
    case Severity.Info:
      return 'Info';
    case Severity.Warning:
      return 'Warning';
    case Severity.Error:
      return 'Error';
    case Severity.Critical:
      return 'Critical';
    default:
      return 'Unknown';
  }
}
