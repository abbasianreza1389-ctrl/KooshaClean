import os
def setup_otel_if_enabled():
    try:
        if os.environ.get("KOOSHA_ENABLE_OTEL","").lower() not in ("1","true","yes"): return
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry import trace
        endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT","http://localhost:4318")
        service = os.environ.get("OTEL_SERVICE_NAME","koosha-backend")
        provider = TracerProvider(resource=Resource.create({"service.name": service}))
        provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint + "/v1/traces")))
        trace.set_tracer_provider(provider)
    except Exception as e:
        print("OTel disabled:", e)
