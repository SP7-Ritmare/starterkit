# http://stackoverflow.com/questions/1036409/recursively-convert-python-object-graph-to-dictionary

def todict(obj, classkey=None):
    if isinstance(obj, dict):
        data = {}
        for (k, v) in obj.items():
            data[k] = todict(v, classkey)
        return data
    elif hasattr(obj, "_ast"):
        return todict(obj._ast())
    elif hasattr(obj, "__dict__"):
        data = {key: todict(value, classkey)
                for key, value in obj.__dict__.items()
                if not callable(value) and not key.startswith('_')}
        if classkey is not None and hasattr(obj, "__class__"):
            data[classkey] = obj.__class__.__name__
        return data
    else:
        return obj
