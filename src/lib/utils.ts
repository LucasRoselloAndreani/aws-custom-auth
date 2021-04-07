export const getDomainWithEnv = (
    environment: string,
    domain: string
  ): string => {
    let domainWithPrefix = [environment === "prod" ? null : environment, domain];
    domainWithPrefix = domainWithPrefix.filter((el) => el != null);
    return domainWithPrefix.join(".");
  };
  
  export const getEnvironmentName = (environment: string): string => {
    let name = "";
    switch (environment) {
      case "test":
        name = "Test";
        break;
      case "dev":
        name = "Development";
        break;
      case "prod":
        name = "Production";
        break;
    }
    return name;
  };
  