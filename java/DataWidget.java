
package datawidgets;

import com.twosigma.beakerx.widget.Widget;
import com.twosigma.beakerx.widget.DOMWidget;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class DataWidget extends Widget {


  public static final String MODEL_MODULE_VALUE = "jupyter-datawidgets";
  public static final String MODEL_MODULE_VERSION_VALUE = "~4.0.0";


  public DataWidget() {
    super();
    openComm();
  }

  public String getModelModuleValue(){
    return MODEL_MODULE_VALUE;
  }

  public String getModelModuleVersionValue(){
    return MODEL_MODULE_VERSION_VALUE;
  }

}
