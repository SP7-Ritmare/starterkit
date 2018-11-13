import os, sys
import docker


class ContainerUtil:

    def __init__(self, **kwargs):
        self.client = kwargs["client"]
        self.component = kwargs["component"]
        self.instname = kwargs["instance_name"]


    @property
    def container(self):
        return self._get_container()


    def _get_container(self):

        try:
            container = [c for c in self.client.containers.list(
                    filters={
                        'label': 'org.geonode.component={0}'.format(self.component),
                        'status': 'running'
                    }
                ) if '{0}'.format(self.instname) in c.name][0]
        except:
            raise
        return container


def main():
    c = docker.from_env()
    command = "{}".format("/usr/local/bin/invoke collectmetrics")
    django = ContainerUtil(
        client=c,
        component="django",
        instance_name=os.getenv('GEONODE_INSTANCE_NAME', 'starterkit')
    ).container
    out = django.exec_run(cmd=command, tty=True)
    print(out)

if __name__ == '__main__':
    main()
