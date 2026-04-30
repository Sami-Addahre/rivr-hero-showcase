const EXTERNAL_BASE = "https://made10.retescuolevallagarina.it";
const isBrowserDev = typeof window !== "undefined" && import.meta.env.DEV;

export type SchoolType = {
  id: string;
  name: string;
  description: string | null;
};

export type SchoolPhone = { id: string; number: string; label: string | null };
export type SchoolEmail = { id: string; email: string; label: string | null };
export type SchoolVideo = {
  id: string;
  title: string | null;
  description: string | null;
  video_file: string | null;
  youtube_id: string | null;
  type: string | null;
};

export type School = {
  id: string;
  name: string;
  short_name: string | null;
  type: string | SchoolType;
  logo: string | null;
  website_url: string | null;
  description: string | null;
  detailed_info: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  miur_code: string | null;
  responsabile_orientamento: string | null;
  canteen: boolean;
  boarding: boolean;
  main_campus: boolean;
  position: { type: "Point"; coordinates: [number, number] } | null;
  school_phones?: SchoolPhone[];
  school_emails?: SchoolEmail[];
  videos?: SchoolVideo[];
};

export type SchoolEvent = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  is_online: boolean;
  online_link: string | null;
  school: string | { id: string; name: string; short_name?: string | null };
};

export const fileUrl = (id: string | null | undefined, w = 400) =>
  id ? `${EXTERNAL_BASE}/assets/${id}?width=${w}&quality=80` : null;

async function getJSON<T>(path: string): Promise<T> {
  const url = isBrowserDev
    ? `/api/directus?path=${encodeURIComponent(path)}`
    : `${EXTERNAL_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${path} ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export const fetchSchools = () =>
  getJSON<School[]>("/items/schools?limit=-1&fields=*,type.id,type.name,type.description");

export const fetchSchool = async (id: string): Promise<School> => {
  // Base fetch with type relation (safe, used in list view too)
  const base = await getJSON<School>(
    `/items/schools/${id}?fields=*,type.id,type.name,type.description`,
  );
  // Try to enrich with relations that may or may not exist
  const [phones, emails, videos] = await Promise.all([
    getJSON<SchoolPhone[]>(
      `/items/school_phones?limit=-1&filter[school][_eq]=${id}&fields=id,number,label`,
    ).catch(() => [] as SchoolPhone[]),
    getJSON<SchoolEmail[]>(
      `/items/school_emails?limit=-1&filter[school][_eq]=${id}&fields=id,email,label`,
    ).catch(() => [] as SchoolEmail[]),
    getJSON<SchoolVideo[]>(
      `/items/videos?limit=-1&filter[school][_eq]=${id}&fields=id,title,description,video_file,youtube_id,type`,
    ).catch(() => [] as SchoolVideo[]),
  ]);
  return { ...base, school_phones: phones, school_emails: emails, videos };
};

export const fetchSchoolTypes = () => getJSON<SchoolType[]>("/items/school_types?limit=-1");

export const fetchEvents = () =>
  getJSON<SchoolEvent[]>(
    "/items/events?limit=-1&sort=start_date&fields=*,school.id,school.name,school.short_name",
  );

export const fetchEventsForSchool = (schoolId: string) =>
  getJSON<SchoolEvent[]>(`/items/events?limit=-1&sort=start_date&filter[school][_eq]=${schoolId}`);
