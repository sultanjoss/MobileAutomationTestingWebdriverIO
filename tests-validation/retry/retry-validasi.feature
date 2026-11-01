@RetryValidation
Feature: Validasi mekanisme Smart Retry

  @Retryable
  Scenario: TC-RETRY-001 - Memastikan scenario gagal dicoba ulang
    Given sistem menjalankan scenario validasi retry
