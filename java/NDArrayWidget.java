
package datawidgets;

import com.twosigma.beakerx.widget.Widget;
import com.twosigma.beakerx.widget.DOMWidget;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class NDArrayWidget extends DataWidget {


  public static final String MODEL_NAME_VALUE = "NDArrayModel";
  public static final String ARRAY = "array";

  private NDArray array = null;

  public NDArrayWidget() {
    super();
    openComm();
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  public NDArray getArray() {
    return array;
  }
  public void setArray(NDArray array){
    this.array = array;
    sendUpdate(ARRAY, array);
  }

}
