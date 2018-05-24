
package datawidgets.serializers;

import org.nd4j.linalg.factory.Nd4j;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.serde.binary.BinarySerde;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import datawidgets.NDArrayWidget;

import java.io.IOException;

public class NDArraySerializer extends JsonSerializer<INDArray> {
    @Override
    public void serialize(INDArray value, JsonGenerator jgen, SerializerProvider provider)
            throws IOException, JsonProcessingException {

        synchronized (value) {
            jgen.writeStartObject();
            jgen.writeObjectField("buffer", BinarySerde.toByteBuffer(value));
            jgen.writeObjectField("shape", value.shape());
            jgen.writeObjectField("dtype", value.getDType());
            jgen.writeEndObject();
        }

    }
}