export type Project = {
    name: string,
    id: string,
    note: string,
};

export type Customer = {
    name: string,
    id: string,
    note: string,
    projects: Project[],
};

export type Service = {
    name: string,
    id: string,
    note: string,
};

export type TimeEntry = {
    id: string,
    date_at: string,
    minutes: number,
    note: string,
    project: Project,
    service: Service,
};