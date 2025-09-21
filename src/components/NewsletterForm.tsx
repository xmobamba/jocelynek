import { type ChangeEvent, type FormEventHandler, useMemo, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '../lib/supabaseClient';

type NewsletterFormData = {
  email: string;
  firstName: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof NewsletterFormData, string>>;

type NewsletterInsertPayload = {
  email: string;
  first_name: string;
  consent: boolean;
  subscribed_at: string;
};

type NewsletterClient = {
  insert: (values: NewsletterInsertPayload) => Promise<{ error: PostgrestError | null }>;
};

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

type NewsletterFormProps = {
  client?: NewsletterClient;
};

const initialData: NewsletterFormData = {
  email: '',
  firstName: '',
  consent: false,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const defaultClient: NewsletterClient = {
  insert: async (values) => {
    const { error } = await supabase.from('newsletter').insert(values);
    return { error };
  },
};

const NewsletterForm = ({ client = defaultClient }: NewsletterFormProps) => {
  const [formData, setFormData] = useState<NewsletterFormData>(initialData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const isLoading = status === 'loading';

  const resetForm = () => {
    setFormData(initialData);
    setFormErrors({});
    setSubmissionError(null);
    setStatus('idle');
  };

  const validate = (): FormErrors => {
    const errors: FormErrors = {};
    const trimmedEmail = formData.email.trim();
    const trimmedFirstName = formData.firstName.trim();

    if (!trimmedEmail) {
      errors.email = "L'adresse e-mail est requise.";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = "Merci de saisir une adresse e-mail valide.";
    }

    if (!trimmedFirstName) {
      errors.firstName = 'Le prénom est requis pour personnaliser nos messages.';
    }

    if (!formData.consent) {
      errors.consent = "Nous avons besoin de votre consentement pour vous envoyer des actualités.";
    }

    return errors;
  };

  const hasErrors = useMemo(() => Object.keys(formErrors).length > 0, [formErrors]);

  const handleChange = (field: keyof NewsletterFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = field === 'consent' ? event.target.checked : event.target.value;
      setFormData((previous) => ({ ...previous, [field]: value }));

      if (formErrors[field]) {
        setFormErrors((previous) => ({ ...previous, [field]: undefined }));
      }
    };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const errors = validate();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStatus('error');
      setSubmissionError('Veuillez vérifier les informations fournies.');
      return;
    }

    setStatus('loading');
    setSubmissionError(null);

    try {
      const { error } = await client.insert({
        email: formData.email.trim().toLowerCase(),
        first_name: formData.firstName.trim(),
        consent: formData.consent,
        subscribed_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      setStatus('success');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue. Merci d'essayer à nouveau.";

      setStatus('error');
      setSubmissionError(
        message ||
          "Impossible d'enregistrer votre inscription pour le moment. Vérifiez votre connexion et réessayez.",
      );
    }
  };

  return (
    <form className="newsletter" onSubmit={handleSubmit} noValidate>
      <div className="newsletter__row">
        <label className="newsletter__label" htmlFor="newsletter-email">
          Adresse e-mail
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="prenom@email.com"
          className="newsletter__input"
          value={formData.email}
          onChange={handleChange('email')}
          disabled={isLoading || status === 'success'}
          aria-invalid={Boolean(formErrors.email)}
          aria-describedby={formErrors.email ? 'newsletter-email-error' : undefined}
          required
        />
        {formErrors.email ? (
          <p id="newsletter-email-error" className="newsletter__error" role="alert">
            {formErrors.email}
          </p>
        ) : null}
      </div>

      <div className="newsletter__row">
        <label className="newsletter__label" htmlFor="newsletter-first-name">
          Prénom
        </label>
        <input
          id="newsletter-first-name"
          name="firstName"
          type="text"
          autoComplete="given-name"
          placeholder="Camille"
          className="newsletter__input"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          disabled={isLoading || status === 'success'}
          aria-invalid={Boolean(formErrors.firstName)}
          aria-describedby={formErrors.firstName ? 'newsletter-first-name-error' : undefined}
          required
        />
        {formErrors.firstName ? (
          <p id="newsletter-first-name-error" className="newsletter__error" role="alert">
            {formErrors.firstName}
          </p>
        ) : null}
      </div>

      <div className="newsletter__checkbox">
        <input
          id="newsletter-consent"
          name="consent"
          type="checkbox"
          checked={formData.consent}
          onChange={handleChange('consent')}
          disabled={isLoading || status === 'success'}
          aria-invalid={Boolean(formErrors.consent)}
          aria-describedby={formErrors.consent ? 'newsletter-consent-error' : undefined}
          required
        />
        <label htmlFor="newsletter-consent">
          J'accepte de recevoir les communications marketing de Jocelyne K et je confirme avoir pris
          connaissance de la politique de confidentialité.
        </label>
      </div>
      {formErrors.consent ? (
        <p id="newsletter-consent-error" className="newsletter__error" role="alert">
          {formErrors.consent}
        </p>
      ) : null}

      <button
        type="submit"
        className="newsletter__submit"
        disabled={isLoading || status === 'success'}
        aria-live="polite"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="newsletter__spinner" aria-hidden>
            <svg viewBox="0 0 24 24" role="presentation">
              <circle className="newsletter__spinner-track" cx="12" cy="12" r="10" />
              <circle className="newsletter__spinner-indicator" cx="12" cy="12" r="10" />
            </svg>
            Envoi en cours...
          </span>
        ) : status === 'success' ? (
          'Inscription confirmée !'
        ) : (
          "S'inscrire"
        )}
      </button>

      <div className="newsletter__feedback" aria-live="polite">
        {status === 'success' ? (
          <p className="newsletter__success">
            Merci ! Votre adresse est ajoutée à notre liste sécurisée. Vous recevrez bientôt un e-mail de
            bienvenue avec un code exclusif.
          </p>
        ) : null}
        {status === 'error' && submissionError && !hasErrors ? (
          <p className="newsletter__error" role="alert">
            {submissionError}
          </p>
        ) : null}
      </div>

      {status === 'success' ? (
        <button type="button" className="newsletter__reset" onClick={resetForm}>
          Ajouter une autre personne
        </button>
      ) : null}
    </form>
  );
};

export default NewsletterForm;

export type { NewsletterClient, NewsletterFormProps };
